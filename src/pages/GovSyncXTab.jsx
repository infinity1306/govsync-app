import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Globe, LineChart, Coins, Scale, Users, Shield, Zap, Target,
  PieChart, Video, Link, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2,
  Cpu, Building2, HardHat, FileText, ArrowRight, PlayCircle, BarChart3, Presentation, Database
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ComposedChart, Line, Legend } from 'recharts';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STRATEGIC_TABS = [
  { id: 'city-portfolio', label: '1. City Portfolio', icon: <Globe size={18} /> },
  { id: 'auto-plan', label: '2. Auto DPR & Scenarios', icon: <Target size={18} /> },
  { id: 'cabinet-debate', label: '3. Multi-Agent Debate', icon: <MessageSquare size={18} /> },
  { id: 'smart-execution', label: '4. Smart Execution', icon: <Cpu size={18} /> },
  { id: 'live-economy', label: '5. Live OGD Data', icon: <Database size={18} /> },
];

export default function GovSyncXTab() {
  const [activeStage, setActiveStage] = useState('city-portfolio');
  const [cityBudget, setCityBudget] = useState(100);
  const [projectBudget, setProjectBudget] = useState(5);
  const [cabinetMode, setCabinetMode] = useState(false);
  
  // OGD API State
  const [gstData, setGstData] = useState([]);
  const [gstLoading, setGstLoading] = useState(false);

  useEffect(() => {
    if (activeStage === 'live-economy' && gstData.length === 0) {
      setGstLoading(true);
      fetch('https://api.data.gov.in/resource/14613c4e-5ab0-4705-b440-e4e49ae345de?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=10')
        .then(res => res.json())
        .then(data => {
          if (data && data.records) {
            setGstData(data.records);
          }
        })
        .catch(err => console.error("OGD API Error:", err))
        .finally(() => setGstLoading(false));
    }
  }, [activeStage, gstData.length]);

  const portfolioData = [
    { name: 'Hospital Roads', value: 40, impact: 'High', color: '#EF4444' },
    { name: 'School Zones', value: 30, impact: 'High', color: '#3B82F6' },
    { name: 'Flood Areas', value: 20, impact: 'Critical', color: '#06B6D4' },
    { name: 'Industrial', value: 10, impact: 'Medium', color: '#F59E0B' },
  ];

  const marketTickers = [
    { name: 'Steel TMT', price: '₹62,000/MT', trend: '+1.2%', up: true },
    { name: 'Bitumen VG30', price: '₹48,500/MT', trend: '-0.8%', up: false },
    { name: 'Cement PPC', price: '₹340/Bag', trend: '+0.5%', up: true },
    { name: 'Labor Base', price: '₹450/Day', trend: '0.0%', up: true },
  ];

  if (cabinetMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0F172A', color: 'white', zIndex: 9999, padding: '40px', overflowY: 'auto' }}>
        <button onClick={() => setCabinetMode(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Presentation size={18} /> Exit Cabinet Mode
        </button>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, #60A5FA, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GovSync AI Executive Summary
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#94A3B8' }}>Bhopal Smart City Infrastructure Portfolio (FY 26-27)</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Investment</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>₹100 Cr</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Citizen Impact</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10B981' }}>+8.4/10</div>
              <div style={{ fontSize: '0.9rem', color: '#34D399' }}>1.2M citizens benefited</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Estimated ROI</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#60A5FA' }}>24.5%</div>
              <div style={{ fontSize: '0.9rem', color: '#93C5FD' }}>Economic Growth factor</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', color: 'white' }}>Key Recommendations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <CheckCircle2 color="#10B981" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Prioritize Hospital Corridors</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '4px' }}>Allocating 40% of the budget to medical zone approach roads reduces emergency response times by 18%.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <CheckCircle2 color="#10B981" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Concrete Upgrade for Flood Zones</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '4px' }}>While 35% more expensive initially, shifting from bitumen to rigid concrete in Ward 4 saves ₹12Cr in 10-year maintenance.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <AlertTriangle color="#F59E0B" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>Material Cost Risk</h4>
                  <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '4px' }}>Steel prices expected to rise 4% by Q3. Tenders for flyovers should be released within 14 days to lock prices.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            <BrainCircuit size={14} /> GovSync X: Autonomous OS
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
            AI Infrastructure Intelligence
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            The AI acts as Chief Planner, Auditor, and Advisor. You make the final call.
          </p>
        </div>
        <div>
          <button onClick={() => setCabinetMode(true)} style={{ background: '#4F46E5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
            <Presentation size={18} /> Cabinet Mode
          </button>
        </div>
      </div>

      {/* NAVIGATION */}
      <div style={{ display: 'flex', gap: '12px', background: 'var(--bg)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        {STRATEGIC_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStage(tab.id)}
            style={{
              flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700,
              background: activeStage === tab.id ? 'var(--card-bg)' : 'transparent',
              color: activeStage === tab.id ? '#6366F1' : 'var(--text-muted)',
              boxShadow: activeStage === tab.id ? 'var(--shadow-sm)' : 'none',
              border: activeStage === tab.id ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: CITY PORTFOLIO OPTIMIZER */}
        {activeStage === 'city-portfolio' && (
          <motion.div key="city-portfolio" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
              <motion.div variants={fadeUp} className="premium-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <Globe size={20} color="#3B82F6" /> AI Strategic Portfolio Advisor
                </h3>
                <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Government Total Budget (Simulation)</span>
                    <span style={{ fontWeight: 800, color: '#6366F1', fontSize: '1.1rem' }}>₹{cityBudget} Crore</span>
                  </div>
                  <input 
                    type="range" min="10" max="500" value={cityBudget} onChange={(e) => setCityBudget(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#6366F1' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>₹10 Cr</span><span>₹500 Cr</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Optimized Distribution</h4>
                    <div style={{ height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie data={portfolioData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Citizen Impact Engine</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 700 }}>Travel Time Saved</div>
                        <div style={{ fontSize: '1rem', color: '#10B981', fontWeight: 800 }}>{(cityBudget * 0.18).toFixed(1)}M mins/yr</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#3B82F6', fontWeight: 700 }}>Fuel Savings (Economy)</div>
                        <div style={{ fontSize: '1rem', color: '#3B82F6', fontWeight: 800 }}>₹{(cityBudget * 0.45).toFixed(1)} Cr/yr</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 700 }}>CO₂ Emissions Reduced</div>
                        <div style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 800 }}>{(cityBudget * 12.4).toFixed(0)} Tons</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <BarChart3 size={18} color="#10B981" /> Infrastructure ROI
                </h3>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{((cityBudget / 100) * 24.5).toFixed(1)}%</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 700 }}>10-Year Economic Return</div>
                  
                  <div style={{ width: '100%', marginTop: '24px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Governance Score</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transparency & Efficiency</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366F1' }}>94/100</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '94%', background: '#6366F1' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: AUTO DPR & SCENARIOS */}
        {activeStage === 'auto-plan' && (
          <motion.div key="auto-plan" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div variants={fadeUp} className="premium-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="#F59E0B" /> Autonomous Project Planning (Ward 4 Main Road)
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px' }}>Instead of one rigid plan, the AI acts as your Chief Planner, generating multiple execution scenarios based on long-term value.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { name: 'Repair Existing', cost: 2.8, life: 5, time: '3 Months', rec: false, type: 'Bitumen Overlay' },
                  { name: 'Build 2-Lane', cost: 6.2, life: 12, time: '6 Months', rec: false, type: 'Standard Asphalt' },
                  { name: 'Build 4-Lane', cost: 8.4, life: 25, time: '9 Months', rec: false, type: 'High-Density Bitumen' },
                  { name: 'Smart Concrete', cost: 9.8, life: 35, time: '12 Months', rec: true, type: 'Rigid Pavement + Sensors' },
                ].map((s, i) => (
                  <div key={i} style={{ border: s.rec ? '2px solid #10B981' : '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: s.rec ? '#F0FDF4' : 'white', position: 'relative' }}>
                    {s.rec && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>AI RECOMMENDED</div>}
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', marginBottom: '4px', marginTop: s.rec ? '12px' : '0' }}>{s.name}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.rec ? '#047857' : '#0F172A', marginBottom: '16px' }}>₹{s.cost} Cr</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748B' }}>Lifespan</span><span style={{ fontWeight: 700 }}>{s.life} Years</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748B' }}>Timeline</span><span style={{ fontWeight: 700 }}>{s.time}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748B' }}>Material</span><span style={{ fontWeight: 700 }}>{s.type}</span>
                      </div>
                    </div>
                    <button style={{ width: '100%', marginTop: '20px', padding: '8px', borderRadius: '6px', border: s.rec ? 'none' : '1px solid #CBD5E1', background: s.rec ? '#10B981' : 'transparent', color: s.rec ? 'white' : '#475569', fontWeight: 700, cursor: 'pointer' }}>
                      Select Scenario
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="premium-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#4338CA" /> Auto-Generated Detailed Project Report (DPR)
              </h3>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Road Width Recommended:</span> <span style={{ fontSize: '0.9rem' }}>4.5 Meters</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Depts Required:</span> <span style={{ fontSize: '0.9rem' }}>Road, Water, Telecom</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Risk Analysis:</span> <span style={{ fontSize: '0.9rem' }}>Monsoon flooding high probability</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="#10B981" /> <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Environmental Impact:</span> <span style={{ fontSize: '0.9rem' }}>3 Trees affected (Relocation planned)</span></div>
                </div>
                <div style={{ flex: 1, background: '#FFFBEB', padding: '20px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#B45309', marginBottom: '8px' }}>AI Explainability Center</h4>
                  <p style={{ fontSize: '0.85rem', color: '#92400E', lineHeight: 1.5 }}>
                    <strong>Why Smart Concrete?</strong> Data from the last 50 projects shows bitumen roads in Ward 4 degrade 40% faster due to waterlogging. The extra ₹1.4 Cr upfront cost saves ₹4.2 Cr in maintenance over 10 years.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 3: MULTI-AGENT DEBATE */}
        {activeStage === 'cabinet-debate' && (
          <motion.div key="cabinet-debate" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div variants={fadeUp} className="premium-card" style={{ background: 'linear-gradient(to right, #ffffff, #F8FAFC)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#8B5CF6" /> Multi-Agent Negotiation System
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '24px' }}>Instead of a black box, watch our specialized AI agents debate the project parameters to reach the optimal consensus.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#F1F5F9', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Coins size={20} /></div>
                  <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>FINANCE AI</div>
                    <div style={{ fontSize: '0.95rem', color: '#334155' }}>The initial department request of ₹2.8 Cr is too high. Based on current Govt Schedule of Rates, it should be capped at ₹2.4 Cr.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexDirection: 'row-reverse' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Globe size={20} /></div>
                  <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', marginBottom: '4px' }}>ENVIRONMENT AI</div>
                    <div style={{ fontSize: '0.95rem', color: '#334155' }}>Agreed, but we must allocate ₹15 Lakhs for dust suppression and tree relocation. We cannot cut costs there.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Target size={20} /></div>
                  <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3B82F6', marginBottom: '4px' }}>TRAFFIC AI</div>
                    <div style={{ fontSize: '0.95rem', color: '#334155' }}>Four lanes are mandatory. Traffic volume peaks at 4,000 PCUs/hr. A 2-lane road will fail within 14 months.</div>
                  </div>
                </div>

                <div style={{ background: '#4338CA', padding: '20px', borderRadius: '12px', color: 'white', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px' }}>Negotiated Consensus Budget</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>₹2.55 Cr</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Confidence: 94% · Meets all compliance rules</div>
                  </div>
                  <button style={{ background: 'white', color: '#4338CA', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                    Approve AI Consensus
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 4: SMART EXECUTION */}
        {activeStage === 'smart-execution' && (
          <motion.div key="smart-execution" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            <motion.div variants={fadeUp} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#3B82F6" /> AI Market Intelligence & Procurement
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {marketTickers.map((item, i) => (
                  <div key={i} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{item.price}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: item.up ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      {item.trend} {item.up ? '↑' : '↓'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>AI Procurement Advisor</div>
                <div style={{ fontSize: '0.8rem', color: '#15803D' }}>Bitumen prices are down. Recommendation: Pre-procure 500MT for Q4 projects immediately.</div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={20} color="#F59E0B" /> AI Drone Construction Monitoring
              </h3>
              <div style={{ background: '#1E293B', borderRadius: '12px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', animation: 'pulse 2s infinite' }}></div> LIVE DRONE FEED
                </div>
                <PlayCircle size={48} color="rgba(255,255,255,0.8)" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>AI Scan: Compaction Density</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10B981' }}>98% (Pass)</div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="premium-card" style={{ gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link size={20} color="#8B5CF6" /> Digital Budget Wallet (Blockchain Simulation)
              </h3>
              <div className="gov-table-container">
                <table className="gov-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>Transaction ID (Hash)</th>
                      <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>Action</th>
                      <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.8rem', textTransform: 'uppercase' }}>Signatures (AI + Human)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#8B5CF6' }}>0x8f4d...3a2b</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 500 }}>Advance Escrow Transfer</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>₹45,00,000</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>✅ AI Audit + ✍️ Admin</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#8B5CF6' }}>0x4b1a...9f8c</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 500 }}>Material Invoice Cleared</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>₹12,40,000</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>✅ Fraud Scan + ✍️ Engineer</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* VIEW 5: LIVE OGD DATA (GST REVENUE) */}
        {activeStage === 'live-economy' && (
          <motion.div key="live-economy" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* API Provenance Banner */}
            <motion.div variants={fadeUp} style={{ background: 'linear-gradient(90deg, #0F172A, #1E293B)', padding: '20px 24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '10px' }}><Database size={22} color="#10B981" /></div>
                <div>
                  <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>Open Government Data Platform India</div>
                  <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '2px' }}>Live API Fetch · data.gov.in · OAS 2.0 REST Endpoint</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {gstLoading ? (
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', padding: '6px 16px', borderRadius: '20px' }}>⏳ Fetching API...</div>
                ) : gstData.length > 0 ? (
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '6px 16px', borderRadius: '20px' }}>✅ {gstData.length} Records Loaded</div>
                ) : null}
              </div>
            </motion.div>

            {/* Chart Card */}
            <motion.div variants={fadeUp} className="premium-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="#3B82F6" /> GST Revenue: Budget vs Actuals (₹ Crore)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '24px' }}>
                Year-wise Details of Actual Revenue Collection (Net Central GST) compared to Budget / Revised Estimates from 2019-20 to 2023-24. Source: Rajya Sabha.
              </p>

              {gstData.length > 0 ? (
                <div style={{ height: '380px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={gstData} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="financial_year" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#10B981', fontSize: 12 }} dx={10} tickFormatter={(val) => `${val}%`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                        formatter={(value, name) => [name.includes('%') ? `${value}%` : `₹${Number(value).toLocaleString('en-IN')} Cr`, name]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '16px' }} />
                      <Bar yAxisId="left" dataKey="budget_estimates_be_" name="Budget Estimate (BE)" fill="#93C5FD" radius={[4, 4, 0, 0]} maxBarSize={55} />
                      <Bar yAxisId="left" dataKey="revised_estimates_re_" name="Revised Estimate (RE)" fill="#FDBA74" radius={[4, 4, 0, 0]} maxBarSize={55} />
                      <Bar yAxisId="left" dataKey="actual_collection" name="Actual Collection" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={55} />
                      <Line yAxisId="right" type="monotone" dataKey="_of_be_achieved" name="% of BE Achieved" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                !gstLoading && <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No data available from API.</div>
              )}
            </motion.div>

            {/* Data Table */}
            {gstData.length > 0 && (
              <motion.div variants={fadeUp} className="premium-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#8B5CF6" /> Raw API Data (JSON → Table)
                </h3>
                <div className="gov-table-container">
                  <table className="gov-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Financial Year</th>
                        <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Budget Est. (BE)</th>
                        <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Revised Est. (RE)</th>
                        <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>Actual Collection</th>
                        <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>% BE Achieved</th>
                        <th style={{ padding: '12px', fontWeight: 700, color: '#64748B', fontSize: '0.78rem', textTransform: 'uppercase' }}>% RE Achieved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstData.map((row, i) => {
                        const beAchieved = row._of_be_achieved;
                        const beColor = beAchieved >= 100 ? '#10B981' : beAchieved >= 90 ? '#F59E0B' : '#EF4444';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{row.financial_year}</td>
                            <td style={{ padding: '12px', fontSize: '0.85rem' }}>₹{Number(row.budget_estimates_be_).toLocaleString('en-IN')} Cr</td>
                            <td style={{ padding: '12px', fontSize: '0.85rem' }}>₹{Number(row.revised_estimates_re_).toLocaleString('en-IN')} Cr</td>
                            <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>₹{Number(row.actual_collection).toLocaleString('en-IN')} Cr</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: beColor, background: beColor + '15' }}>
                                {beAchieved}%
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{row._of_re_achieved}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* API Metadata Footer */}
            <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'API Source', value: 'data.gov.in', color: '#3B82F6' },
                { label: 'Dataset', value: 'Central GST Revenue', color: '#8B5CF6' },
                { label: 'Organization', value: 'Rajya Sabha', color: '#10B981' },
                { label: 'Format', value: 'REST JSON', color: '#F59E0B' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: item.color, marginTop: '4px' }}>{item.value}</div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
