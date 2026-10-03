import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Activity, Database, AlertCircle, RefreshCw, Trees, CloudRain, Zap, Wind } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const API_KEY = '579b464db66ec23bdd00000121e1a1c73ad8469d485815eca879bb86';

const DATASETS = [
  {
    id: 'imd',
    name: 'IMD Monsoon Forecast',
    resource: 'd24d3d66-f71b-4652-8b3b-81cc5d42d3bf',
    icon: <CloudRain size={18} color="#3B82F6" />,
    color: '#3B82F6',
    limit: 10
  },
  {
    id: 'forest',
    name: 'India Forest Cover (FSI)',
    resource: 'f1735387-1264-47e5-a618-096068fa4452',
    icon: <Trees size={18} color="#10B981" />,
    color: '#10B981',
    limit: 10
  },
  {
    id: 'power',
    name: 'Power Supply Position',
    resource: '5d0ffff5-9b4c-4736-887a-c10643698c7f',
    icon: <Zap size={18} color="#F59E0B" />,
    color: '#F59E0B',
    limit: 100
  },
  {
    id: 'aqi',
    name: 'Real-time AQI',
    resource: '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69',
    icon: <Wind size={18} color="#8B5CF6" />,
    color: '#8B5CF6',
    limit: 1000
  }
];

export default function OpenDataTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    imd: [],
    forest: [],
    power: [],
    aqi: []
  });

  useEffect(() => {
    async function fetchDatasets() {
      setLoading(true);
      setError(null);
      
      try {
        const results = await Promise.all(
          DATASETS.map(async (ds) => {
            const url = `https://api.data.gov.in/resource/${ds.resource}?api-key=${API_KEY}&format=json&limit=${ds.limit}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${ds.name}`);
            const result = await response.json();
            return { id: ds.id, records: result.records || [] };
          })
        );
        
        const nextData = { imd: [], forest: [], power: [], aqi: [] };
        
        results.forEach(res => {
          if (res.id === 'imd') {
            nextData.imd = res.records.map(r => ({
              year: r.year,
              actual: parseInt(r.actual, 10),
              forecast: parseInt(r._forecast, 10),
              remark: r.remark
            }));
          } else if (res.id === 'forest') {
            nextData.forest = res.records.map(r => ({
              year: r.india_state_of_forest_report_,
              cover: parseInt(r.total_forest_cover, 10),
              increase: parseInt(r.increase_in_forest_cover_w_r_t__previous_assessment, 10)
            }));
          } else if (res.id === 'power') {
            // Filter by Madhya Pradesh
            const mpRecords = res.records.filter(r => r.state___system___region?.includes('Madhya Pradesh') || r.state___system___region?.includes('Bhopal'));
            const dataToUse = mpRecords.length > 0 ? mpRecords : res.records.slice(0, 5); // Fallback if no MP data
            nextData.power = dataToUse.map(r => ({
              state: r.state___system___region,
              req: parseInt(r.energy___april__2012___march_2013___requirement_____mu__, 10),
              avail: parseInt(r.energy___april__2012___march_2013___availability_____mu__, 10)
            }));
          } else if (res.id === 'aqi') {
            // Filter by Madhya Pradesh
            const mpRecords = res.records.filter(r => r.state === 'Madhya Pradesh');
            const dataToUse = mpRecords.length > 0 ? mpRecords : res.records; // Fallback
            nextData.aqi = dataToUse
              .filter(r => r.pollutant_id !== 'PM2.5' && r.avg_value !== 'NA') // Filter out invalid entries
              .slice(0, 10) // Limit to 10 for UI cleaniness
              .map(r => ({
                city: r.city,
                pollutant: r.pollutant_id,
                avg: parseInt(r.avg_value, 10)
              }));
          }
        });
        
        setData(nextData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDatasets();
  }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ─── HEADER ─── */}
      <motion.div variants={fadeUp} className="premium-card" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={24} color="#6366F1" /> National Open Data Intelligence
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '4px' }}>
              Real-time statistical data powered by Data.gov.in (OGD Platform India)
            </p>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8' }}>
              <Activity className="spin" size={20} /> Fetching from API...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
              <RefreshCw size={20} /> Live Data Sync Active
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── ERROR STATE ─── */}
      {error && (
        <motion.div variants={fadeUp} className="premium-card" style={{ background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '12px', color: '#B91C1C' }}>
          <AlertCircle size={24} />
          <div>
            <strong>API Fetch Error:</strong> {error}. Make sure you have an internet connection and the API key is valid.
          </div>
        </motion.div>
      )}

      {/* ─── DATASET CHARTS ─── */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* IMD Forecast vs Actual */}
          <motion.div variants={fadeUp} className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudRain size={20} color="#3B82F6" /> IMD Monsoon Forecast vs Actual
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              All India Summer Monsoon Rainfall (2020 - 2024). Values in percentage of LPA.
            </p>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.imd} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Context/Remarks */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
              {data.imd.map(item => (
                <div key={item.year} style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '120px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.year}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: item.remark === 'Accurate' ? '#10B981' : '#F59E0B' }}>
                    {item.remark}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Forest Cover */}
          <motion.div variants={fadeUp} className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trees size={20} color="#10B981" /> India State of Forest Report
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Total Forest Cover (sq. km) vs Increase from Previous Assessment.
            </p>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.forest} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis yAxisId="left" orientation="left" domain={['dataMin - 10000', 'dataMax + 10000']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="cover" name="Total Forest Cover" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="increase" name="Increase (sq km)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          
          {/* Power Supply */}
          <motion.div variants={fadeUp} className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#F59E0B" /> Power Supply Position (Energy)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Requirement vs Availability (MU) across different states.
            </p>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.power} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="state" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="req" name="Requirement (MU)" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="avail" name="Availability (MU)" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Realtime AQI */}
          <motion.div variants={fadeUp} className="premium-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wind size={20} color="#8B5CF6" /> Real-time AQI Pollutant Index
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Average value of different pollutants across various locations.
            </p>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.aqi} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis dataKey="city" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={80} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="avg" name="Avg Index Value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      )}
    </motion.div>
  );
}
