import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGovContext } from '../context/GovContext';

// Fix Leaflet default icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const makeIcon = (color, size = 18) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="${color}" stroke="#FFFFFF" stroke-width="3"/></svg>`;
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const STATUS_COLORS = {
  'Pending Coordination': '#F59E0B',
  'Approved': '#0A2540',
  'Blocked': '#EF4444',
  'Completed': '#00C48C'
};

const WEATHER_KEY = '182f167b0f424143b8161b7f44302680';

const makePopup = (p) => `
  <div style="font-family:Inter,sans-serif;color:#1A1A2E;min-width:200px;padding:4px">
    <b style="font-size:1.05em">${p.id}</b><br/>
    <span style="color:#64748B;font-size:0.85em">Dept:</span> ${p.dept}<br/>
    <span style="color:#64748B;font-size:0.85em">Status:</span> <span style="color:${STATUS_COLORS[p.status] || '#475569'};font-weight:700">${p.status}</span><br/>
    <span style="color:#64748B;font-size:0.85em">Budget:</span> ₹${p.amount}Cr<br/>
    <span style="color:#64748B;font-size:0.85em">Contractor:</span> ${p.contractor || 'Unassigned'}
    <div id="weather-info-${p.id}" style="margin-top:8px;padding-top:8px;border-top:1px solid #E2E8F0;font-size:0.85em;color:#3B82F6;display:flex;align-items:center;gap:6px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0-4.5-4.5"/><path d="M22 12a5 5 0 0 0-9.8-1.5M12.2 7.5a7 7 0 1 0-11 5"/></svg>
      Loading live weather...
    </div>
  </div>
`;

export default function GisMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [layers, setLayers] = useState({ pwd: true, completed: true, conflicts: true });
  const [baseMap, setBaseMap] = useState('standard');
  const layerGroupsRef = useRef({ pwd: null, completed: null, conflicts: null });
  const tileLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { projects, aiWarnings } = useGovContext();

  // Compute marker categories from real data
  const conflictProjectIds = useMemo(() => {
    return new Set((aiWarnings || []).filter(w => !w.acknowledged).map(w => w.projectRef));
  }, [aiWarnings]);

  const markerCategories = useMemo(() => {
    const allProjects = projects || [];
    return {
      pwd: allProjects.filter(p => p.status !== 'Completed' && !conflictProjectIds.has(p.id)),
      completed: allProjects.filter(p => p.status === 'Completed'),
      conflicts: allProjects.filter(p => conflictProjectIds.has(p.id))
    };
  }, [projects, conflictProjectIds]);

  // Initialize map ONCE
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.2599, 77.4126],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
    }).addTo(map);

    // Create empty layer groups
    layerGroupsRef.current = {
      pwd: L.layerGroup().addTo(map),
      completed: L.layerGroup().addTo(map),
      conflicts: L.layerGroup().addTo(map)
    };

    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 200);
    setTimeout(() => map.invalidateSize(), 500);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Rebuild markers when projects/warnings update (without re-initializing the map)
  useEffect(() => {
    const groups = layerGroupsRef.current;
    if (!groups.pwd) return;

    // Clear all existing markers
    groups.pwd.clearLayers();
    groups.completed.clearLayers();
    groups.conflicts.clearLayers();

    // Populate "Active Projects" layer
    markerCategories.pwd.forEach(p => {
      if (p.latitude && p.longitude) {
        const color = STATUS_COLORS[p.status] || '#0A2540';
        const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon(color) });
        marker.bindPopup(makePopup(p));
        marker.on('click', async () => {
          try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${p.latitude}&lon=${p.longitude}&appid=${WEATHER_KEY}&units=metric`);
            const data = await res.json();
            const weatherDiv = document.getElementById(`weather-info-${p.id}`);
            if (weatherDiv && data.main) {
              weatherDiv.innerHTML = `🌤️ <b>${data.main.temp}°C</b>, ${data.weather[0].description}`;
            }
          } catch (e) {
            const weatherDiv = document.getElementById(`weather-info-${p.id}`);
            if (weatherDiv) weatherDiv.innerHTML = `Weather unavailable`;
          }
        });
        groups.pwd.addLayer(marker);
      }
    });

    // Populate "Completed Projects" layer
    markerCategories.completed.forEach(p => {
      if (p.latitude && p.longitude) {
        const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon('#00C48C') });
        marker.bindPopup(makePopup(p));
        marker.on('click', async () => {
          try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${p.latitude}&lon=${p.longitude}&appid=${WEATHER_KEY}&units=metric`);
            const data = await res.json();
            const weatherDiv = document.getElementById(`weather-info-${p.id}`);
            if (weatherDiv && data.main) {
              weatherDiv.innerHTML = `🌤️ <b>${data.main.temp}°C</b>, ${data.weather[0].description}`;
            }
          } catch (e) {
            const weatherDiv = document.getElementById(`weather-info-${p.id}`);
            if (weatherDiv) weatherDiv.innerHTML = `Weather unavailable`;
          }
        });
        groups.completed.addLayer(marker);
      }
    });

    // Populate "Conflict Zones" layer
    markerCategories.conflicts.forEach(p => {
      if (p.latitude && p.longitude) {
        const marker = L.marker([p.latitude, p.longitude], { icon: makeIcon('#EF4444', 22) });
        const warning = (aiWarnings || []).find(w => w.projectRef === p.id && !w.acknowledged);
        const popupHtml = `
          <div style="font-family:Inter,sans-serif;color:#1A1A2E;min-width:200px;padding:4px">
            <b style="color:#EF4444;font-size:1.05em">⚠️ CONFLICT DETECTED</b><br/>
            <b>${p.id}</b> — ${p.name}<br/>
            <span style="color:#64748B;font-size:0.85em">Dept:</span> ${p.dept}<br/>
            ${warning ? `<span style="color:#991B1B;font-size:0.9em">${warning.message}</span><br/>` : ''}
            <b>Action: DA Approval Required</b>
          </div>
        `;
        marker.bindPopup(popupHtml);
        groups.conflicts.addLayer(marker);
      }
    });
  }, [markerCategories, aiWarnings]);

  // Update base map layer based on selection
  useEffect(() => {
    if (!tileLayerRef.current) return;
    
    let url = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    if (baseMap === 'satellite') url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    if (baseMap === 'terrain') url = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
    
    // Mappls REST API integration (mGIS Backbone)
    if (baseMap === 'mgis') {
      const MAPPLS_KEY = '147df55152dfdc1a6acfbc7189a88b';
      url = `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_KEY}/retina_map/{z}/{x}/{y}.png`;
    }
    
    tileLayerRef.current.setUrl(url);
  }, [baseMap]);

  // Toggle layers when checkboxes change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const groups = layerGroupsRef.current;
    if (!map || !groups.pwd) return;

    Object.keys(layers).forEach(key => {
      if (layers[key]) {
        if (!map.hasLayer(groups[key])) map.addLayer(groups[key]);
      } else {
        if (map.hasLayer(groups[key])) map.removeLayer(groups[key]);
      }
    });
  }, [layers]);

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const optimizeRoute = async () => {
    const map = mapInstanceRef.current;
    // Need at least 2 points to route
    if (!map || markerCategories.pwd.length < 2) {
      alert("Not enough active projects to generate a route.");
      return;
    }
    
    setIsOptimizing(true);
    try {
      const coords = markerCategories.pwd.map(p => `${p.longitude},${p.latitude}`).join(';');
      const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?overview=full&geometries=geojson`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.code === 'Ok' && data.trips && data.trips.length > 0) {
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
        }
        
        const routeGeoJSON = data.trips[0].geometry;
        routeLayerRef.current = L.geoJSON(routeGeoJSON, {
          style: {
            color: '#6366F1',
            weight: 5,
            opacity: 0.9,
            dashArray: '8, 8'
          }
        }).addTo(map);
        
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
      } else {
        alert("Could not calculate an optimized route via OSRM.");
      }
    } catch (e) {
      console.error("OSRM Route Error:", e);
      alert("Failed to connect to routing engine.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <section className="section bg-white" id="map-section">
      <div className="container">
        <div className="text-center fade-up visible">
          <span className="section-label">📍 Spatial Intelligence</span>
          <h2 className="section-title">Live GIS Map Integration</h2>
          <p className="section-subtitle">Every project plotted on a live map. Click markers for project details.</p>
        </div>
        <div className="map-layout fade-up visible">
          <div className="map-sidebar">
            <h4>Live Data Feeds</h4>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setBaseMap('standard')}
                style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '20px', border: '1px solid #E2E8F0', background: baseMap === 'standard' ? '#0F172A' : 'white', color: baseMap === 'standard' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
              >Standard</button>
              <button 
                onClick={() => setBaseMap('satellite')}
                style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '20px', border: '1px solid #E2E8F0', background: baseMap === 'satellite' ? '#0F172A' : 'white', color: baseMap === 'satellite' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
              >Satellite</button>
              <button 
                onClick={() => setBaseMap('terrain')}
                style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '20px', border: '1px solid #E2E8F0', background: baseMap === 'terrain' ? '#0F172A' : 'white', color: baseMap === 'terrain' ? 'white' : '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
              >Terrain</button>
              <button 
                onClick={() => setBaseMap('mgis')}
                style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '20px', border: '1px solid #E2E8F0', background: baseMap === 'mgis' ? '#10B981' : 'white', color: baseMap === 'mgis' ? 'white' : '#10B981', cursor: 'pointer', transition: 'all 0.2s' }}
              >mGIS (Mappls)</button>
            </div>

            <h4>Project Overlays</h4>
            <label className="map-layer">
              <input type="checkbox" checked={layers.pwd} onChange={() => toggleLayer('pwd')} />
              <span className="layer-dot" style={{ background: 'var(--primary)' }}></span> Active Projects ({markerCategories.pwd.length})
            </label>
            <label className="map-layer">
              <input type="checkbox" checked={layers.completed} onChange={() => toggleLayer('completed')} />
              <span className="layer-dot" style={{ background: 'var(--accent)' }}></span> Completed ({markerCategories.completed.length})
            </label>
            <label className="map-layer">
              <input type="checkbox" checked={layers.conflicts} onChange={() => toggleLayer('conflicts')} />
              <span className="layer-dot" style={{ background: 'var(--danger)' }}></span> Conflict Zones ({markerCategories.conflicts.length})
            </label>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            
            <h4>Inspection Logistics</h4>
            <button 
              onClick={optimizeRoute} 
              disabled={isOptimizing}
              style={{
                width: '100%',
                padding: '10px',
                background: isOptimizing ? '#CBD5E1' : '#6366F1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '16px',
                transition: 'background 0.2s'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
              {isOptimizing ? 'Optimizing...' : 'Optimize Site Visit Route'}
            </button>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📍 Centered on Bhopal, MP. Click markers for details.</p>
          </div>
          <div
            ref={mapContainerRef}
            id="gis-map"
            style={{ height: '100%', width: '100%', minHeight: '500px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
          />
        </div>
      </div>
    </section>
  );
}
