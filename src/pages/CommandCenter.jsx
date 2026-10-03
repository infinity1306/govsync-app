import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, ShieldCheck, Activity, Users, Clock, Leaf, Zap, BrainCircuit
} from 'lucide-react';
import { useGovContext, DASHBOARD_METRICS } from '../context/GovContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const fundFlowData = [
  { name: 'Jan', released: 400, utilized: 240 },
  { name: 'Feb', released: 300, utilized: 139 },
  { name: 'Mar', released: 200, utilized: 980 },
  { name: 'Apr', released: 278, utilized: 390 },
  { name: 'May', released: 189, utilized: 480 },
  { name: 'Jun', released: 239, utilized: 380 },
  { name: 'Jul', released: 349, utilized: 430 },
];

const budgetDistribution = [
  { name: 'Roads', value: 400 },
  { name: 'Water', value: 300 },
  { name: 'Electricity', value: 300 },
  { name: 'Sewage', value: 200 },
];
const COLORS = ['#6366F1', '#0EA5E9', '#F59E0B', '#10B981'];

export default function CommandCenter() {
  const { stats } = useGovContext();
  const { nationalStats, sustainability, departmentPerformance } = DASHBOARD_METRICS;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ─── HEADER METRICS (GRAND FINALE) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        <motion.div variants={fadeUp} className="premium-card" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ opacity: 0.8, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Government Money Saved</div>
            <TrendingUp size={20} opacity={0.8} />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0' }}>{nationalStats.moneySaved}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>By preventing {nationalStats.reExcavationsPrevented} repeated excavations</div>
        </motion.div>

        <motion.div variants={fadeUp} className="premium-card" style={{ background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Approval Time</div>
            <Clock size={20} color="#6366F1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0' }}>{nationalStats.avgApprovalTime.split(' ')[0]}</div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>{nationalStats.avgApprovalTime.substring(6)}</div>
        </motion.div>

        <motion.div variants={fadeUp} className="premium-card" style={{ background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Risk Reduction</div>
            <ShieldCheck size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0' }}>{nationalStats.infrastructureRiskReduction}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Via AI Predictive Analysis</div>
        </motion.div>

        <motion.div variants={fadeUp} className="premium-card" style={{ background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Citizen Satisfaction</div>
            <Users size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0' }}>{nationalStats.citizenSatisfaction}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transparency Portal Feedback</div>
        </motion.div>
      </div>

      {/* ─── CHARTS SECTION ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', overflow: 'hidden' }}>
        
        {/* Main Chart */}
        <motion.div variants={fadeUp} className="premium-card" style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Fund Flow Dynamics</h3>
            <span className="premium-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>Live Metrics</span>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fundFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUtilized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(value) => `₹${value}L`} />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
                <Area type="monotone" dataKey="released" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorReleased)" name="Funds Released" />
                <Area type="monotone" dataKey="utilized" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorUtilized)" name="Funds Utilized" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Side Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, overflow: 'hidden' }}>
          {/* Department Leaderboard */}
          <motion.div variants={fadeUp} className="premium-card" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="#F59E0B" /> Performance Leaderboard
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {departmentPerformance.map((dept, idx) => (
                <div key={dept.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx === 0 ? '#FEF3C7' : '#F1F5F9', color: idx === 0 ? '#D97706' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dept.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Response: {dept.responseTime}</div>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: idx === 0 ? '#10B981' : '#6366F1', flexShrink: 0 }}>{dept.score}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── BOTTOM ROW: SUSTAINABILITY & DISTRIBUTION ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Sustainability Dashboard */}
        <motion.div variants={fadeUp} className="premium-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Leaf size={18} color="#10B981" /> Sustainability Impact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '20px', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌳</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#166534' }}>{sustainability.treesProtected}</div>
              <div style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: 600 }}>Trees Protected</div>
            </div>
            <div style={{ padding: '20px', background: '#FEFCE8', borderRadius: '16px', border: '1px solid #FEF08A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💧</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#854D0E' }}>{sustainability.waterConserved}</div>
              <div style={{ fontSize: '0.85rem', color: '#A16207', fontWeight: 600 }}>Water Conserved</div>
            </div>
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CO₂ Emissions Saved</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{sustainability.co2Saved}</div>
              </div>
              <Zap size={32} color="#F59E0B" opacity={0.2} />
            </div>
          </div>
        </motion.div>

        {/* Budget Distribution (Pie Chart) */}
        <motion.div variants={fadeUp} className="premium-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={18} color="#6366F1" /> AI Budget Intelligence
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', height: '220px' }}>
            <div style={{ height: 260, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PieChart width={300} height={260}>
                  <Pie
                    data={budgetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  </PieChart>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {budgetDistribution.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1 }}>{entry.name}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{entry.value}L</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
