import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Sparkles, Route, LayoutGrid, Brain, ShieldAlert, CalendarClock, IndianRupee, TrendingDown, BarChart3, MapPinned, Smartphone, BellRing, GitMerge, Cpu, User, Info, ClipboardList, Landmark, UploadCloud, ShieldCheck, CalendarCheck, GanttChart, Hammer, CheckCircle2, ChevronRight, MapPin, Building2, HardHat, IndianRupee as Rupee, Users, Play, LayoutDashboard, FilePlus, CalendarRange, ShieldAlert as ShieldAlert2, BadgeCheck, Flag, Layers, Map, Car, Satellite, AlertTriangle, Building, Droplet, Zap, Wifi, Trees, TrendingUp, Code2, Network, Expand, GraduationCap, Hospital, Wind, TrainFront, Monitor, Wallet, ArrowRight, FileBarChart, Settings, Bell, Code, Server, Database, Fingerprint, Cloud } from 'lucide-react';
import GisMap from '../components/GisMap';

export default function Landing() {
  // Drag and drop state
  const [conflict, setConflict] = useState(false);
  const trackRef = useRef(null);
  const waterRef = useRef(null);
  const pwdRef = useRef(null);
  const [waterLeft, setWaterLeft] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartLeft, setDragStartLeft] = useState(0);

  // Counter animation
  const [countersAnimated, setCountersAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          setCountersAnimated(true);
          document.querySelectorAll('.stat-value[data-target]').forEach(counter => {
            const target = +counter.dataset.target;
            const prefix = counter.dataset.prefix || '';
            const suffix = counter.dataset.suffix || '';
            let current = 0;
            const increment = target / 80;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                clearInterval(timer);
                counter.textContent = prefix + target + suffix;
              } else {
                counter.textContent = prefix + Math.ceil(current) + suffix;
              }
            }, 20);
          });
        }
      });
    }, { threshold: 0.5 });
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) counterObserver.observe(statsBar);

    // Progress bar animation
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.progress-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
          });
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.fund-card').forEach(el => progressObserver.observe(el));

    return () => { observer.disconnect(); counterObserver.disconnect(); progressObserver.disconnect(); };
  }, [countersAnimated]);

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragStartLeft(waterLeft);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !trackRef.current || !waterRef.current || !pwdRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let newLeft = dragStartLeft + (clientX - dragStartX);
      const max = trackRef.current.clientWidth - waterRef.current.clientWidth - 10;
      newLeft = Math.max(5, Math.min(newLeft, max));
      setWaterLeft(newLeft);
      const wR = waterRef.current.getBoundingClientRect();
      const pR = pwdRef.current.getBoundingClientRect();
      setConflict(wR.right > pR.left && wR.left < pR.right);
    };
    const handleEnd = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStartX, dragStartLeft]);

  return (
    <>
      {/* ========== 2. HERO ========== */}
      <section className="hero" id="home">
        <div className="container hero-content fade-up">
          <div className="hero-left">
            <h1>Building Smarter<br/>Infrastructure with<br/>Artificial Intelligence</h1>
            <p className="hero-sub">GovSync Fast unifies government departments, data and processes into one intelligent platform for better planning, faster execution and greater transparency.</p>
            <div className="hero-ctas">
              <a href="#demo" className="btn btn-primary" style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 600 }}>Request Demo</a>
              <Link to="/login" className="btn btn-outline" style={{ background: 'white', color: 'black', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 600 }}>Watch Platform</Link>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="glass-dashboard">
              <div className="glass-header">Live Overview</div>
              <div className="glass-grid">
                <div className="glass-map">
                  {/* Map image via CSS background */}
                  <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px' }}>
                    <MapPin size={24} color="#3B82F6" style={{ position: 'absolute', top: '20%', left: '30%' }} />
                    <MapPin size={24} color="#10B981" style={{ position: 'absolute', top: '50%', left: '70%' }} />
                    <MapPin size={24} color="#F59E0B" style={{ position: 'absolute', top: '70%', left: '40%' }} />
                    <MapPin size={24} color="#8B5CF6" style={{ position: 'absolute', top: '30%', left: '60%' }} />
                  </div>
                </div>
                <div className="glass-stats">
                  <div className="glass-stat-box">
                    <span className="glass-stat-label">Total Projects</span>
                    <span className="glass-stat-value">1,528</span>
                  </div>
                  <div className="glass-stat-box">
                    <span className="glass-stat-label">Total Budget</span>
                    <span className="glass-stat-value">₹12,500 Cr</span>
                  </div>
                  <div className="glass-stat-box">
                    <span className="glass-stat-label">Departments</span>
                    <span className="glass-stat-value">45+</span>
                  </div>
                  <div className="glass-stat-box">
                    <span className="glass-stat-label">AI Accuracy</span>
                    <span className="glass-stat-value">99.3%</span>
                  </div>
                </div>
                <div className="glass-bottom-left">
                  <div className="glass-progress">
                    <span className="glass-stat-label">Construction Progress</span>
                    <div className="circle-chart">
                       <span>72%</span>
                    </div>
                  </div>
                  <div className="glass-alerts">
                    <span className="glass-stat-label">AI Alerts</span>
                    <span className="glass-stat-value" style={{ color: '#EF4444', fontSize: '1.8rem', display: 'block', margin: '10px 0 5px' }}>24</span>
                    <span style={{ fontSize: '0.75rem', color: '#EF4444' }}>High Priority</span>
                  </div>
                </div>
                <div className="glass-bottom-right">
                  <span className="glass-stat-label">Upcoming Deadlines</span>
                  <ul className="glass-list">
                    <li><span className="dot"></span> Bridge Project - Zone 4 <span className="date">12 May 2024</span></li>
                    <li><span className="dot"></span> Water Pipeline - Phase 2 <span className="date">18 May 2024</span></li>
                    <li><span className="dot"></span> Smart Road - Corridor 7 <span className="date">22 May 2024</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3. PROBLEM ========== */}
      <section className="section bg-white" id="problem">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><AlertCircle size={14} /> The Core Problem</span>
            <h2 className="section-title">The Broken Status Quo</h2>
            <p className="section-subtitle">Here's what happens today in every district, every year — costing taxpayers crores.</p>
          </div>
          <div style={{ margin: '0 auto 60px', maxWidth: '1000px' }}>
            <img 
              src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1200" 
              alt="Uncoordinated road excavation" 
              loading="eager"
              style={{ width: '100%', height: '350px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} 
            />
          </div>
          <div className="timeline">
            <div className="tl-item fade-up">
              <div className="tl-dot"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              <div className="tl-card">
                <span className="tl-date">July 2024</span>
                <h4>✅ Road Built by PWD</h4>
                <p>Brand new 4-lane smart road constructed. Total cost: ₹40 Cr. Citizens celebrate.</p>
              </div>
            </div>
            <div className="tl-item bad fade-up delay-1">
              <div className="tl-dot"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
              <div className="tl-card">
                <span className="tl-date">January 2025 — 6 months later</span>
                <h4>❌ Water Pipe Dug Up</h4>
                <p>Water Department digs up the new road to lay pipelines. Traffic diverted for 3 weeks.</p>
              </div>
            </div>
            <div className="tl-item bad fade-up delay-2">
              <div className="tl-dot"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
              <div className="tl-card">
                <span className="tl-date">March 2025</span>
                <h4>❌ Telecom Digs Again</h4>
                <p>Partially repaired road dug again for 5G fiber optic cables. Road quality degrades 70%.</p>
              </div>
            </div>
            <div className="tl-item bad fade-up delay-3">
              <div className="tl-dot"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
              <div className="tl-card">
                <span className="tl-date">June 2025</span>
                <h4>❌ Electricity Cable Laid</h4>
                <p>Underground power line work starts. Road is now unusable. ₹50 Cr+ wasted in 12 months.</p>
              </div>
            </div>
          </div>
          <div className="problem-bottom fade-up">
            ⚠️ Result: Road damaged 3x. ₹50 Cr+ wasted. This happens in every district, every year.
          </div>
        </div>
      </section>

      {/* ========== 4. SOLUTION ========== */}
      <section className="section bg-light" id="solution">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><Sparkles size={14} /> The GovSync Way</span>
            <h2 className="section-title">One Platform. Every Department. Zero Conflicts.</h2>
            <p className="section-subtitle">GovSync forces every department to register, plan, and coordinate before any excavation begins.</p>
          </div>
          <div style={{ margin: '0 auto 40px', maxWidth: '1000px' }}>
            <img 
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200" 
              alt="Smart City Infrastructure" 
              loading="eager"
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} 
            />
          </div>
          <div className="solution-visual fade-up">
            <div className="flow-row">
              <div className="flow-node"><div className="flow-icon"><Landmark size={28} /></div><h4>Government Portal</h4><p>Project creation</p></div>
              <div className="flow-arrow"><ChevronRight size={24} /></div>
              <div className="flow-node"><div className="flow-icon"><UploadCloud size={28} /></div><h4>Project Registration</h4><p>All details logged</p></div>
              <div className="flow-arrow"><ChevronRight size={24} /></div>
              <div className="flow-node"><div className="flow-icon"><ShieldCheck size={28} /></div><h4>District Admin</h4><p>Reviews & assigns</p></div>
              <div className="flow-arrow"><ChevronRight size={24} /></div>
              <div className="flow-node"><div className="flow-icon"><Cpu size={28} /></div><h4>AI Coordination Cell</h4><p>Conflict detection</p></div>
            </div>
            <div className="flow-divider">▼ Departments Notified Simultaneously</div>
            <div className="flow-dept-row">
              <div className="dept-chip"><HardHat size={16} /> PWD</div>
              <div className="dept-chip"><Droplet size={16} /> Water</div>
              <div className="dept-chip"><Zap size={16} /> Electricity</div>
              <div className="dept-chip"><Wifi size={16} /> Telecom</div>
              <div className="dept-chip"><Trees size={16} /> Environment</div>
            </div>
            <div className="flow-divider">▼ Optimized Combined Work Plan</div>
            <div className="flow-row">
              <div className="flow-node"><div className="flow-icon" style={{ background: 'rgba(var(--accent-rgb), 0.2)', borderColor: 'var(--accent)' }}><CalendarCheck size={28} /></div><h4>Coordination Meeting</h4><p>All stakeholders</p></div>
              <div className="flow-arrow"><ChevronRight size={24} /></div>
              <div className="flow-node"><div className="flow-icon" style={{ background: 'rgba(var(--accent-rgb), 0.2)', borderColor: 'var(--accent)' }}><GanttChart size={28} /></div><h4>Combined Schedule</h4><p>AI-optimized</p></div>
              <div className="flow-arrow"><ChevronRight size={24} /></div>
              <div className="flow-node"><div className="flow-icon" style={{ background: 'rgba(var(--accent-rgb), 0.2)', borderColor: 'var(--accent)' }}><Hammer size={28} /></div><h4>Simultaneous Execution</h4><p>One-time dig</p></div>
              <div className="flow-arrow"><ChevronRight size={24} /></div>
              <div className="flow-node"><div className="flow-icon" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}><CheckCircle2 size={28} /></div><h4>Project Complete</h4><p>Zero re-digs</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. HOW IT WORKS ========== */}
      <section className="section bg-white" id="how-it-works">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><Route size={14} /> Step by Step</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">From project proposal to one-time completion in 6 simple steps.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card fade-up"><span className="step-num">01</span><div className="step-icon-box"><FilePlus size={22} /></div><h4>Government Uploads Project</h4><p>Project RD-2026-101, ₹40Cr, Bhopal — with location, scope, and timeline.</p></div>
            <div className="step-card fade-up delay-1"><span className="step-num">02</span><div className="step-icon-box"><BellRing size={22} /></div><h4>System Auto-Notifies All Depts</h4><p>Water, Telecom, Electricity — every relevant department is instantly alerted.</p></div>
            <div className="step-card fade-up delay-2"><span className="step-num">03</span><div className="step-icon-box"><CalendarRange size={22} /></div><h4>Each Dept Responds</h4><p>Departments submit their timeline requirements & budget estimates.</p></div>
            <div className="step-card fade-up delay-3"><span className="step-num">04</span><div className="step-icon-box"><ShieldAlert size={22} /></div><h4>AI Detects Conflicts</h4><p>"Pipeline must complete before road surfacing" — enforced automatically.</p></div>
            <div className="step-card fade-up delay-4"><span className="step-num">05</span><div className="step-icon-box"><BadgeCheck size={22} /></div><h4>Coordinator Approves Schedule</h4><p>District Admin reviews and approves the optimized master plan.</p></div>
            <div className="step-card fade-up delay-5"><span className="step-num">06</span><div className="step-icon-box"><Flag size={22} /></div><h4>Simultaneous Execution</h4><p>All departments work in sequence. Road built once. Project complete.</p></div>
          </div>
          <div className="gantt-wrap fade-up">
            <h4 style={{ marginBottom: '8px' }}>Optimized Timeline — Project RD-2026-101</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>All departments coordinated in a single 10-month execution window.</p>
            <div className="gantt-header">
              {['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10'].map(m => <div key={m} className="gantt-month">{m}</div>)}
            </div>
            <div className="gantt-row"><div className="gantt-label">Water Pipeline</div><div className="gantt-track"><div className="gantt-bar" style={{ width: '30%', left: '0', background: '#3B82F6' }}>M1–M3</div></div></div>
            <div className="gantt-row"><div className="gantt-label">Telecom Cable</div><div className="gantt-track"><div className="gantt-bar" style={{ width: '20%', left: '20%', background: '#8B5CF6' }}>M3–M4</div></div></div>
            <div className="gantt-row"><div className="gantt-label">Electricity</div><div className="gantt-track"><div className="gantt-bar" style={{ width: '15%', left: '35%', background: '#F59E0B' }}>M4–M5</div></div></div>
            <div className="gantt-row"><div className="gantt-label">PWD Road</div><div className="gantt-track"><div className="gantt-bar" style={{ width: '50%', left: '50%', background: 'var(--primary)' }}>M6–M10</div></div></div>
          </div>
        </div>
      </section>

      {/* ========== 6. FEATURES ========== */}
      <section className="section bg-light" id="features">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><LayoutGrid size={14} /> Role-Based Access</span>
            <h2 className="section-title">Dashboards for Every Stakeholder</h2>
            <p className="section-subtitle">Six dedicated portals — one unified database powering them all.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card fade-up" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=600" alt="Government Dashboard" loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}><div className="feat-icon feat-blue"><Landmark size={24} /></div><h3>Government Dashboard</h3><p>Create master projects, approve budgets, and monitor real-time district progress with analytics.</p></div>
            </div>
            <div className="feature-card fade-up delay-1" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1569691105751-88df003de7a4?auto=format&fit=crop&q=80&w=600" alt="District Admin Portal" loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}><div className="feat-icon feat-orange"><MapPin size={24} /></div><h3>District Admin Portal</h3><p>Coordinate all departments, resolve scheduling conflicts, enforce timelines, and hold coordination meetings.</p></div>
            </div>
            <div className="feature-card fade-up delay-2" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600" alt="Department Portal" loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}><div className="feat-icon feat-teal"><Building2 size={24} /></div><h3>Department Portal</h3><p>PWD, Water, Telecom accept work orders, upload engineering plans, and report daily progress with photos.</p></div>
            </div>
            <div className="feature-card fade-up delay-3" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1581092787765-e3feb951d987?auto=format&fit=crop&q=80&w=600" alt="Contractor Dashboard" loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}><div className="feat-icon feat-rose"><HardHat size={24} /></div><h3>Contractor Dashboard</h3><p>Receive digital work orders, track daily labor/material logs, upload site photos, and submit milestone bills.</p></div>
            </div>
            <div className="feature-card fade-up delay-4" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600" alt="Finance Portal" loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}><div className="feat-icon feat-green"><IndianRupee size={24} /></div><h3>Finance & Audit Portal</h3><p>Milestone-based fund release, automated expenditure tracking, and complete audit trail for every rupee.</p></div>
            </div>
            <div className="feature-card fade-up delay-5" style={{ overflow: 'hidden', padding: 0 }}>
              <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600" alt="Citizen Portal" loading="lazy" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '24px' }}><div className="feat-icon feat-purple"><Users size={24} /></div><h3>Citizen Portal</h3><p>Public transparency: view ongoing works near you, report potholes, get SMS/WhatsApp updates on projects.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 7. AI FEATURES ========== */}
      <section className="ai-section" id="ai-demo">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><Brain size={14} /> AI-Powered</span>
            <h2 className="section-title">Intelligence Built In</h2>
            <p className="section-subtitle">Eight ML-powered modules that make coordination automatic, not bureaucratic.</p>
          </div>
          <div className="ai-grid">
            <div className="ai-card fade-up"><span className="live">Core</span><ShieldAlert size={26} /><h4>Conflict Detection</h4><p>Automatically prevents physical overlap of works across departments using spatial analysis.</p></div>
            <div className="ai-card fade-up delay-1"><CalendarClock size={26} /><h4>Automatic Scheduling</h4><p>Generates optimal Gantt charts considering dependencies, weather, and resource availability.</p></div>
            <div className="ai-card fade-up delay-2"><IndianRupee size={26} /><h4>Smart Budget Allocation</h4><p>AI-optimized fund distribution across departments based on scope, priority, and past performance.</p></div>
            <div className="ai-card fade-up delay-3"><TrendingDown size={26} /><h4>Delay Prediction</h4><p>Flags high-risk projects before delays happen using historical data and weather patterns.</p></div>
            <div className="ai-card fade-up delay-4"><BarChart3 size={26} /><h4>Impact Analysis</h4><p>Simulates the ripple effect of schedule changes across the entire project ecosystem.</p></div>
            <div className="ai-card fade-up delay-5"><MapPinned size={26} /><h4>GIS Map Integration</h4><p>Spatial overlay of all projects on a live map with underground utility detection.</p></div>
            <div className="ai-card fade-up"><Smartphone size={26} /><h4>Digital Approval Workflow</h4><p>Paperless approvals with e-signatures and Aadhaar authentication for officials.</p></div>
            <div className="ai-card fade-up"><BellRing size={26} /><h4>Real-time Notifications</h4><p>Instant SMS, email, and push alerts for approvals, conflicts, milestones, and delays.</p></div>
          </div>

          {/* Interactive AI Conflict Widget */}
          <div className="ai-widget fade-up">
            <div className="widget-head">
              <h4>🤖 Interactive Demo: AI Conflict Detection</h4>
              <span className={`badge ${conflict ? 'badge-danger' : 'badge-success'}`}>{conflict ? '⚠️ Conflict!' : 'AI Active'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>Drag the <strong>Water Pipeline</strong> block to the right until it overlaps with the <strong>PWD Road</strong> block to trigger the AI.</p>
            <div className="widget-track" ref={trackRef}>
              <div className="drag-block drag-water" ref={waterRef} style={{ left: `${waterLeft}px`, cursor: isDragging ? 'grabbing' : 'grab', background: conflict ? '#EF4444' : '#3B82F6' }} onMouseDown={handleDragStart} onTouchStart={handleDragStart}>💧 Water Pipeline</div>
              <div className="drag-block drag-pwd" ref={pwdRef} style={{ left: '380px', background: conflict ? '#EF4444' : '#0A2540' }}>🛣️ PWD Road Surfacing</div>
            </div>
            {conflict && (
              <div className="conflict-box">
                <AlertTriangle size={20} />
                ⚠️ Conflict Detected: Water pipeline work must complete BEFORE road surfacing begins.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 7.5 AI-ASSISTED PLANNING ========== */}
      <section className="section bg-light" id="ai-planning">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><GitMerge size={14} /> Human-in-the-Loop AI</span>
            <h2 className="section-title">AI-Assisted Infrastructure Planning</h2>
            <p className="section-subtitle">Combining Human Expertise with AI Intelligence for Better Infrastructure Decisions.</p>
          </div>

          {/* Workflow Diagram */}
          <div className="planning-workflow fade-up" style={{ maxWidth: '900px', margin: '0 auto 60px', textAlign: 'center' }}>
            <div style={{ padding: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 700, width: 'fit-content', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>1. Government Creates Road Proposal</div>
            <div style={{ height: '30px', width: '2px', background: 'var(--border)', margin: '0 auto' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '10px' }}>
              <div>
                <div style={{ padding: '16px', background: 'white', border: '2px solid #94A3B8', borderRadius: '12px', fontWeight: 600, color: '#475569' }}>Assign Survey to PWD Officer</div>
                <div style={{ height: '30px', width: '2px', background: '#94A3B8', margin: '0 auto' }}></div>
                <div style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <User size={20} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} /><br/><strong>PWD Field Survey</strong><br/>Manual Observations & Local Expertise
                </div>
              </div>
              <div>
                <div style={{ padding: '16px', background: 'white', border: '2px solid #3B82F6', borderRadius: '12px', fontWeight: 600, color: '#1E3A8A' }}>AI Starts Parallel Analysis</div>
                <div style={{ height: '30px', width: '2px', background: '#3B82F6', margin: '0 auto' }}></div>
                <div style={{ padding: '16px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', fontSize: '0.9rem' }}>
                  <Cpu size={20} style={{ color: '#3B82F6', marginBottom: '8px' }} /><br/><strong>AI Data Collection</strong><br/>Traffic, GIS, Satellite, Population Data
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <div style={{ width: '50%', height: '2px', background: 'var(--border)', marginTop: '15px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: '-15px', height: '15px', width: '2px', background: '#94A3B8' }}></div>
                <div style={{ position: 'absolute', right: 0, top: '-15px', height: '15px', width: '2px', background: '#3B82F6' }}></div>
              </div>
            </div>
            <div style={{ height: '20px', width: '2px', background: 'var(--border)', margin: '0 auto' }}></div>
            <div style={{ padding: '16px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontWeight: 700, width: 'fit-content', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>Decision Comparison Dashboard</div>
          </div>

          {/* AI vs Human Comparison */}
          <div className="comparison-dashboard fade-up">
            <div className="text-center" style={{ marginBottom: '30px' }}>
              <h3 style={{ color: 'var(--primary)' }}>Decision Comparison Dashboard</h3>
              <p className="text-muted">Project: MG Road Expansion</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* AI Report */}
              <div style={{ display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)', borderRadius: '12px' }}>
                <div style={{ padding: '16px 20px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary)', color: 'white' }}>
                  <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={18} /> AI Recommendation</span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)' }}>94% Confidence</span>
                </div>
                <div style={{ padding: '24px', background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', flex: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '4px' }}>4 Lane Road</h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Recommended Width: 24 meters</p>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Estimated Cost:</span><strong>₹56 Crore</strong></li>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Expected Capacity:</span><strong>20 Years</strong></li>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Traffic Volume:</span><strong style={{ color: 'var(--danger)' }}>High</strong></li>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Population Growth:</span><strong>12% annually</strong></li>
                  </ul>
                  <div style={{ marginTop: '24px', padding: '16px', background: '#F0F9FF', borderLeft: '4px solid #3B82F6', borderRadius: '4px' }}>
                    <h5 style={{ color: '#1E3A8A', marginBottom: '8px' }}><Info size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> AI Reasoning:</h5>
                    <p style={{ fontSize: '0.85rem', color: '#1E3A8A', marginBottom: '6px' }}>• Traffic exceeds capacity during peak hours.</p>
                    <p style={{ fontSize: '0.85rem', color: '#1E3A8A', marginBottom: '6px' }}>• Population expected to increase by 35%.</p>
                    <p style={{ fontSize: '0.85rem', color: '#1E3A8A', marginBottom: '6px' }}>• New commercial zone and school planned nearby.</p>
                    <p style={{ fontSize: '0.85rem', color: '#1E3A8A', marginBottom: 0 }}>• Future widening will cost more than building 4 lanes now.</p>
                  </div>
                </div>
              </div>
              {/* Officer Report */}
              <div style={{ display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)', borderRadius: '12px' }}>
                <div style={{ background: '#E2E8F0', padding: '16px 20px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} /> PWD Officer Report</span>
                  <span className="badge" style={{ background: 'white', color: 'var(--text-muted)' }}>Rajesh Kumar</span>
                </div>
                <div style={{ padding: '24px', background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', flex: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '4px' }}>3 Lane Road</h2>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Survey Date: 28 June 2026</p>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Estimated Cost:</span><strong>₹48 Crore</strong></li>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Expected Capacity:</span><strong>10 Years</strong></li>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Land Acquisition:</span><strong style={{ color: 'var(--danger)' }}>High Cost</strong></li>
                    <li style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}><span className="text-muted">Utility Relocation:</span><strong>Required</strong></li>
                  </ul>
                  <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg)', borderLeft: '4px solid #94A3B8', borderRadius: '4px' }}>
                    <h5 style={{ color: '#475569', marginBottom: '8px' }}><ClipboardList size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Field Survey Reasoning:</h5>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>• Current traffic is manageable.</p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>• Land acquisition cost is high for 4 lanes.</p>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 0 }}>• Existing drainage requires relocation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Box */}
            <div className="text-center" style={{ marginTop: '40px', padding: '32px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '8px' }}>Government Decision Authority</h4>
              <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.9rem' }}>Approve, Modify, or Reject based on combined intelligence.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>Accept AI Plan</button>
                <button className="btn" style={{ background: 'var(--bg)', color: '#475569', border: '1px solid var(--border)' }}>Accept Officer Plan</button>
                <button className="btn btn-primary"><GitMerge size={18} /> Create Hybrid Plan</button>
                <button className="btn" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>Request Expert Review</button>
              </div>
            </div>

            {/* AI Data Sources */}
            <div style={{ marginTop: '60px', textAlign: 'center' }}>
              <h4 style={{ marginBottom: '20px' }}>AI Data Sources Analyzed</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', fontWeight: 500, color: 'var(--text-muted)' }}><Map size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> GIS Layers</span>
                <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', fontWeight: 500, color: 'var(--text-muted)' }}><Car size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Traffic Density</span>
                <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', fontWeight: 500, color: 'var(--text-muted)' }}><Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Population Growth</span>
                <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', fontWeight: 500, color: 'var(--text-muted)' }}><Satellite size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Satellite Imagery</span>
                <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', fontWeight: 500, color: 'var(--text-muted)' }}><AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Accident History</span>
                <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', padding: '8px 16px', fontWeight: 500, color: 'var(--text-muted)' }}><Building size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Urban Expansion Plans</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== GIS MAP ========== */}
      <GisMap />

      {/* ========== 8. FUND FLOW ========== */}
      <section className="section bg-light" id="fund-flow">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><Wallet size={14} /> Accountability</span>
            <h2 className="section-title">Money Follows Milestones</h2>
            <p className="section-subtitle">No department gets funds until the previous stage is verified and approved.</p>
          </div>
          <div className="fund-card fade-up">
            <div className="fund-flow-row">
              <div className="fund-node" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>🏛️ Govt Treasury<br/><strong>₹40 Cr</strong></div>
              <ArrowRight size={24} style={{ color: 'var(--accent)' }} />
              <div className="fund-node primary">GovSync Escrow</div>
              <ArrowRight size={24} style={{ color: 'var(--accent)' }} />
              <div className="fund-node accent">📊 Executing Departments</div>
            </div>
            <div className="progress-container">
              <div className="progress-item"><div className="progress-header"><span>💧 Water Dept (Pipeline) — ₹4 Cr</span><span style={{ color: 'var(--accent)' }}>100% ✅ Completed</span></div><div className="progress-bar-bg"><div className="progress-fill" data-width="100" style={{ background: 'var(--accent)' }}></div></div></div>
              <div className="progress-item"><div className="progress-header"><span>📡 Telecom (Cables) — ₹1.5 Cr</span><span style={{ color: 'var(--highlight)' }}>60% In Progress</span></div><div className="progress-bar-bg"><div className="progress-fill" data-width="60" style={{ background: 'var(--highlight)' }}></div></div></div>
              <div className="progress-item"><div className="progress-header"><span>⚡ Electricity — ₹1.5 Cr</span><span style={{ color: '#3B82F6' }}>30% Phase 1 Done</span></div><div className="progress-bar-bg"><div className="progress-fill" data-width="30" style={{ background: '#3B82F6' }}></div></div></div>
              <div className="progress-item"><div className="progress-header"><span>🛣️ PWD (Roads) — ₹32 Cr</span><span style={{ color: 'var(--text-muted)' }}>0% Waiting</span></div><div className="progress-bar-bg"><div className="progress-fill" data-width="0" style={{ background: 'var(--text-muted)' }}></div></div></div>
              <div className="progress-item"><div className="progress-header"><span>🌳 Environment — ₹0.5 Cr</span><span style={{ color: 'var(--accent)' }}>100% ✅ Cleared</span></div><div className="progress-bar-bg"><div className="progress-fill" data-width="100" style={{ background: 'var(--accent)' }}></div></div></div>
              <div className="progress-item"><div className="progress-header"><span>🔍 Inspection — ₹0.5 Cr</span><span style={{ color: 'var(--text-muted)' }}>0% Pending</span></div><div className="progress-bar-bg"><div className="progress-fill" data-width="0" style={{ background: 'var(--text-muted)' }}></div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 9. IMPACT ========== */}
      <section className="section bg-white" id="impact">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><TrendingUp size={14} /> Measurable Impact</span>
            <h2 className="section-title">Numbers That Matter</h2>
            <p className="section-subtitle">The quantifiable impact of integrated governance.</p>
          </div>
          <div className="impact-grid fade-up">
            <div className="impact-card"><div className="impact-val">₹500Cr+</div><div className="impact-label">Saved Annually</div></div>
            <div className="impact-card"><div className="impact-val">60%</div><div className="impact-label">Faster Completion</div></div>
            <div className="impact-card"><div className="impact-val">15+</div><div className="impact-label">Depts Integrated</div></div>
            <div className="impact-card"><div className="impact-val" style={{ color: 'var(--primary)' }}>ZERO</div><div className="impact-label">Repeat Excavations</div></div>
          </div>
          <div className="scope-tags fade-up">
            <span className="scope-tag">🛣️ Roads</span>
            <span className="scope-tag">🌉 Bridges</span>
            <span className="scope-tag">💧 Water Supply</span>
            <span className="scope-tag">🚰 Drainage</span>
            <span className="scope-tag">🏫 Schools</span>
            <span className="scope-tag">🏥 Hospitals</span>
            <span className="scope-tag">🚇 Metro</span>
            <span className="scope-tag">🏙️ Smart City</span>
            <span className="scope-tag">⚡ Renewable Energy</span>
          </div>
        </div>
      </section>

      {/* ========== 10. SCALABILITY ========== */}
      <section className="section bg-light" id="scalability">
        <div className="container text-center">
          <div className="fade-up">
            <span className="section-label"><Expand size={14} /> Universal Scale</span>
            <h2 className="section-title">Beyond Roads</h2>
            <p className="section-subtitle">Scalable from a village panchayat to central government ministries.</p>
          </div>
          <div className="scale-grid fade-up">
            <div className="scale-item"><div className="scale-icon"><Droplet size={32} /></div><span>Water Supply</span></div>
            <div className="scale-item"><div className="scale-icon"><Zap size={32} /></div><span>Electricity</span></div>
            <div className="scale-item"><div className="scale-icon"><Wifi size={32} /></div><span>Telecom</span></div>
            <div className="scale-item"><div className="scale-icon"><TrainFront size={32} /></div><span>Metro Rail</span></div>
            <div className="scale-item"><div className="scale-icon"><GraduationCap size={32} /></div><span>Schools</span></div>
            <div className="scale-item"><div className="scale-icon"><Hospital size={32} /></div><span>Hospitals</span></div>
            <div className="scale-item"><div className="scale-icon"><Wind size={32} /></div><span>Renewable</span></div>
            <div className="scale-item"><div className="scale-icon"><Building size={32} /></div><span>Smart City</span></div>
          </div>
        </div>
      </section>

      {/* ========== 11. TECH STACK ========== */}
      <section className="section bg-white" id="tech-stack">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><Code2 size={14} /> For Hackathon Judges</span>
            <h2 className="section-title">Technology Stack</h2>
            <p className="section-subtitle">Production-ready architecture designed for government-grade security and scale.</p>
          </div>
          <div className="tech-grid fade-up">
            <div className="tech-card"><Code size={20} /><div><div className="tech-label">Frontend</div><div className="tech-name">React.js / Next.js</div></div></div>
            <div className="tech-card"><Server size={20} /><div><div className="tech-label">Backend</div><div className="tech-name">Node.js + Express</div></div></div>
            <div className="tech-card"><Database size={20} /><div><div className="tech-label">Database</div><div className="tech-name">PostgreSQL + Redis</div></div></div>
            <div className="tech-card"><Brain size={20} /><div><div className="tech-label">AI / ML</div><div className="tech-name">Python (Scheduling + Conflict)</div></div></div>
            <div className="tech-card"><MapPinned size={20} /><div><div className="tech-label">GIS Maps</div><div className="tech-name">Leaflet.js / Google Maps API</div></div></div>
            <div className="tech-card"><Fingerprint size={20} /><div><div className="tech-label">Auth</div><div className="tech-name">OAuth 2.0 + Aadhaar</div></div></div>
            <div className="tech-card"><Bell size={20} /><div><div className="tech-label">Notifications</div><div className="tech-name">Firebase + WebSockets</div></div></div>
            <div className="tech-card"><Cloud size={20} /><div><div className="tech-label">Hosting</div><div className="tech-name">AWS / Azure Gov Cloud</div></div></div>
          </div>
        </div>
      </section>

      {/* ========== 12. DASHBOARD DEMO ========== */}
      <section className="section bg-light" id="demo">
        <div className="container">
          <div className="text-center fade-up">
            <span className="section-label"><Monitor size={14} /> Interactive Preview</span>
            <h2 className="section-title">District Admin Dashboard</h2>
            <p className="section-subtitle">A realistic preview of the GovSync admin interface for Bhopal district.</p>
          </div>
          <div className="dashboard-frame fade-up" style={{ textAlign: 'center' }}>
            <div className="dash-browser-bar">
              <div className="dash-dot red"></div>
              <div className="dash-dot yellow"></div>
              <div className="dash-dot green"></div>
              <div className="dash-url-bar">🔒 govsync.gov.in/dashboard/bhopal</div>
            </div>
            <div style={{ padding: '60px 40px', background: 'var(--bg)' }}>
              <Network size={48} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Full Interactive Dashboard</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Click below to explore the complete District Admin Dashboard with live data.</p>
              <Link to="/dashboard" className="btn btn-primary">Launch Dashboard <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
