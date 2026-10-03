import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGovContext, DEPARTMENTS } from '../context/GovContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
  Wallet, TrendingUp, AlertTriangle, ShieldCheck, FileText, CheckCircle2,
  XCircle, ArrowRight, Brain, Clock, DollarSign, Building2, HardHat,
  Search, Shield, AlertCircle, RefreshCw, TrendingDown, BookOpen, ShieldAlert,
  FolderOpen
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function AIFundOrchestrationTab() {
  const { projects } = useGovContext();
  const [activeStage, setActiveStage] = useState('planning');

  // ─── Compute live budget summary from real projects ───────────────
  const totalDeptBudget = projects.reduce((s, p) => s + (parseFloat(p.estimatedBudget) || 0), 0);
  const totalAI         = Math.round(totalDeptBudget * 0.85 * 100) / 100;
  const totalReleased   = projects.reduce((s, p) => {
    const allocs = p.fundAllocations || {};
    return s + Object.values(allocs).reduce((a, v) => a + (parseFloat(v) || 0), 0);
  }, 0);
  const totalUtilized   = projects.reduce((s, p) => {
    const util = p.fundUtilization || {};
    return s + Object.values(util).reduce((a, v) => a + (parseFloat(v?.used) || 0), 0);
  }, 0);
  const totalRemaining  = Math.max(0, Math.round((totalReleased - totalUtilized) * 100) / 100);

  // ─── Per-dept utilization across all projects ──────────────────────
  const deptUtilization = DEPARTMENTS.map(dept => {
    let allocated = 0, used = 0;
    projects.forEach(p => {
      allocated += parseFloat(p.fundAllocations?.[dept.id]) || 0;
      used      += parseFloat(p.fundUtilization?.[dept.id]?.used) || 0;
    });
    const pct = allocated > 0 ? Math.round((used / allocated) * 100) : 0;
    return { id: dept.id, name: dept.name, icon: dept.icon, color: dept.color, allocated, used, percent: pct };
  }).filter(d => d.allocated > 0);

  // ─── Per-dept AI estimate comparison table ─────────────────────────
  const deptEstimateRows = DEPARTMENTS.map(dept => {
    let deptTotal = 0;
    projects.forEach(p => {
      const resp = p.aiCoordination?.departmentResponses?.[dept.id];
      if (resp?.budget) deptTotal += parseFloat(resp.budget) || 0;
    });
    if (deptTotal === 0) return null;
    const aiTotal = Math.round(deptTotal * 0.85 * 100) / 100;
    const diff    = Math.round((deptTotal - aiTotal) * 100) / 100;
    return { id: dept.id, name: dept.name, icon: dept.icon, color: dept.color, dept: deptTotal, ai: aiTotal, diff };
  }).filter(Boolean);

  // ─── Efficiency health score ───────────────────────────────────────
  const efficiencyPct = totalReleased > 0 ? Math.round((totalUtilized / totalReleased) * 100) : 0;
  const coordinated   = projects.filter(p => p.aiCoordination).length;
  const riskLevel     = projects.length === 0 ? 'None' : coordinated / projects.length > 0.7 ? 'Low' : 'Medium';

  // ─── Projects with surplus funds ──────────────────────────────────
  const surplusProjects = projects.flatMap(p =>
    DEPARTMENTS.map(dept => {
      const alloc = parseFloat(p.fundAllocations?.[dept.id]) || 0;
      const used  = parseFloat(p.fundUtilization?.[dept.id]?.used) || 0;
      const surplus = Math.round((alloc - used) * 100) / 100;
      return surplus > 0 && alloc > 0
        ? { project: p.name, dept: dept.name, icon: dept.icon, alloc, used, surplus }
        : null;
    }).filter(Boolean)
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ─── HEADER KPIs ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        <motion.div variants={fadeUp} className="premium-card" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Total Dept Budget</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>₹{totalDeptBudget}L</div>
        </motion.div>
        <motion.div variants={fadeUp} className="premium-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Optimized</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366F1', marginTop: '4px' }}>₹{totalAI}L</div>
        </motion.div>
        <motion.div variants={fadeUp} className="premium-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Released</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>₹{totalReleased}L</div>
        </motion.div>
        <motion.div variants={fadeUp} className="premium-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Utilized</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>₹{totalUtilized}L</div>
        </motion.div>
        <motion.div variants={fadeUp} className="premium-card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Remaining</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>₹{totalRemaining}L</div>
        </motion.div>
      </div>

      {/* ─── DEPT UTILIZATION + HEALTH SCORE ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <motion.div variants={fadeUp} className="premium-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#6366F1" /> Department Utilization Status
          </h3>
          {deptUtilization.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No funds allocated yet. Fund releases appear here after departments respond to coordination requests.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deptUtilization.map(dept => (
                <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '90px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{dept.icon}</span> {dept.name.split(' ')[0]}
                  </div>
                  <div style={{ flex: 1, background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      style={{ background: dept.color, height: '100%', borderRadius: '5px' }}
                    />
                  </div>
                  <div style={{ width: '50px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: dept.color }}>
                    {dept.percent}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#10B981" /> Budget Health Score
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Utilization</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{efficiencyPct}%</div>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Level</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: riskLevel === 'Low' ? '#10B981' : '#F59E0B' }}>{riskLevel}</div>
            </div>
            <div style={{ padding: '16px', background: '#FFF7ED', borderRadius: '12px', textAlign: 'center', border: '1px solid #FFEDD5' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase' }}>Projects</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EA580C' }}>{projects.length}</div>
            </div>
            <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', textAlign: 'center', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Coordinated</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16A34A' }}>{coordinated}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── STAGE TABS ─── */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'planning',   label: '1. AI Planning & Quotes',    icon: <FileText size={16} /> },
          { id: 'tendering',  label: '2. Procurement & Tenders',   icon: <HardHat size={16} /> },
          { id: 'execution',  label: '3. Fraud & Smart Release',   icon: <Shield size={16} /> },
          { id: 'learning',   label: '4. AI Budget Learning',      icon: <BookOpen size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStage(tab.id)}
            style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700,
              background: activeStage === tab.id ? '#6366F1' : 'transparent',
              color: activeStage === tab.id ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── TAB 1: AI PLANNING & QUOTES ─── */}
        {activeStage === 'planning' && (
          <motion.div key="planning" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <motion.div variants={fadeUp} className="premium-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={20} color="#8B5CF6" /> AI Estimation vs Department Requests
              </h3>

              {deptEstimateRows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <FolderOpen size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem' }}>No department budget responses yet. Departments submit budget estimates when they respond to coordination requests.</p>
                </div>
              ) : (
                <div className="gov-table-container">
                  <table className="gov-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                        {['Department', 'Dept Estimate', 'AI Estimate', 'Difference', 'AI Reason / Action'].map(h => (
                          <th key={h} style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deptEstimateRows.map(row => {
                        const isOver = row.diff > 0;
                        const isMatch = row.diff === 0;
                        return (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {row.icon} {row.name}
                            </td>
                            <td style={{ padding: '14px 12px', fontWeight: 700 }}>₹{row.dept}L</td>
                            <td style={{ padding: '14px 12px', fontWeight: 700, color: '#10B981' }}>₹{row.ai}L</td>
                            <td style={{ padding: '14px 12px', fontWeight: 800, color: isMatch ? '#10B981' : isOver ? '#DC2626' : '#10B981' }}>
                              {isMatch ? 'Matched' : `+ ₹${row.diff}L`}
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              {isMatch ? (
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                    <CheckCircle2 size={13} /> Within AI limits
                                  </div>
                                  <span style={{ padding: '5px 10px', background: '#D1FAE5', color: '#065F46', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Auto-Approved</span>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                    <AlertCircle size={13} /> Dept estimate higher than AI
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{ padding: '5px 10px', background: '#10B981', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                      onClick={() => alert('Department estimate accepted.')}>Accept Dept</button>
                                    <button style={{ padding: '5px 10px', background: '#F59E0B', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                      onClick={() => alert('Revised to AI estimate. BOQ will be updated.')}>Revise to AI</button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* ─── DYNAMIC BUDGET REALLOCATION ─── */}
            {surplusProjects.length > 0 && (
              <motion.div variants={fadeUp} className="premium-card" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <RefreshCw size={18} /> Dynamic Budget Reallocation Opportunities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {surplusProjects.slice(0, 3).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: '0.85rem', color: '#92400E' }}>
                        <strong>{item.icon} {item.dept}</strong> in <em>{item.project}</em> — Allocated: ₹{item.alloc}L | Used: ₹{item.used}L |{' '}
                        <strong>Surplus: ₹{item.surplus}L</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '6px 12px', background: '#10B981', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => alert(`₹${item.surplus}L reallocated from ${item.dept} to reserve pool.`)}>Reallocate</button>
                        <button style={{ padding: '6px 12px', background: '#EF4444', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => alert('Kept as contingency reserve.')}>Keep</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {surplusProjects.length === 0 && (
              <motion.div variants={fadeUp} className="premium-card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center', padding: '24px' }}>
                <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#166534', fontWeight: 600, fontSize: '0.9rem' }}>No surplus funds detected. All budgets are on track.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── TAB 2: PROCUREMENT & TENDERS ─── */}
        {activeStage === 'tendering' && (
          <motion.div key="tendering" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div variants={fadeUp} className="premium-card" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingDown size={20} color="#3B82F6" /> AI Procurement Advisor
                </h3>
                <div style={{ padding: '6px 12px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  Est. Saving: ₹{Math.round(totalDeptBudget * 0.05)}L via bulk procurement
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Steel Price', trend: '+8%', up: true },
                  { label: 'Bitumen',     trend: '+3%', up: true },
                  { label: 'Cement',      trend: '-2%', up: false },
                  { label: 'Recommendation', special: 'Release Tender Now', color: '#10B981' }
                ].map((item, i) => (
                  <div key={i} style={{ background: item.special ? item.color : 'var(--card-bg)', padding: '16px', borderRadius: '8px', border: `1px solid var(--border)`, textAlign: 'center', color: item.special ? 'white' : 'inherit', cursor: item.special ? 'pointer' : 'default' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: item.special ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{item.label}</div>
                    {item.special
                      ? <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>{item.special}</div>
                      : <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.up ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          {item.trend} {item.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                    }
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="premium-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardHat size={20} color="#F59E0B" /> Smart Contractor Bidding Evaluation
              </h3>
              <div className="gov-table-container">
                <table className="gov-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                      {['Contractor', 'Bid Amount', 'AI Rating', 'Risk Flags', 'Action'].map(h => (
                        <th key={h} style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0FDF4' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 700 }}>Larsen & Toubro Ltd</td>
                      <td style={{ padding: '14px 12px', fontWeight: 800, color: '#10B981' }}>₹{Math.round(totalDeptBudget * 0.51)}L</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>98/100 (Highly Recommended)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Experience: High | Delays: 0%</div>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--text-muted)' }}>None</td>
                      <td style={{ padding: '14px 12px' }}>
                        <button style={{ padding: '8px 14px', background: '#10B981', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => alert('Contract awarded to Larsen & Toubro Ltd.')}>
                          <CheckCircle2 size={14} /> Award Contract
                        </button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 700 }}>Alpha Infra Corp</td>
                      <td style={{ padding: '14px 12px', fontWeight: 800 }}>₹{Math.round(totalDeptBudget * 0.48)}L (Lowest)</td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 }}>64/100 (Average)</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Experience: Medium | Delays: 12%</div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, background: '#FEF2F2', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          ⚠️ Past Fraud Warning
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <button style={{ padding: '8px 14px', background: 'var(--bg)', color: 'var(--text-muted)', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'not-allowed' }}>
                          Rejected by AI
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── TAB 3: FRAUD & SMART RELEASE ─── */}
        {activeStage === 'execution' && (
          <motion.div key="execution" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <motion.div variants={fadeUp} className="premium-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="#8B5CF6" /> Smart Milestone Release
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Total project budget: <strong style={{ color: 'var(--text-primary)' }}>₹{totalDeptBudget}L</strong>. Funds are never released in full — released in verified milestones:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Advance',          percent: '20%', amount: `₹${Math.round(totalDeptBudget * 0.2)}L`, status: 'Released',      color: '#10B981' },
                    { label: 'After Inspection', percent: '30%', amount: `₹${Math.round(totalDeptBudget * 0.3)}L`, status: 'Pending Review', color: '#F59E0B' },
                    { label: 'After Completion', percent: '30%', amount: `₹${Math.round(totalDeptBudget * 0.3)}L`, status: 'Locked',         color: '#94A3B8' },
                    { label: 'Final Audit',      percent: '20%', amount: `₹${Math.round(totalDeptBudget * 0.2)}L`, status: 'Locked',         color: '#94A3B8' }
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', width: '40px' }}>{m.percent}</div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.amount}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.color, background: `${m.color}20`, padding: '4px 10px', borderRadius: '12px' }}>
                        {m.status}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <motion.div variants={fadeUp} className="premium-card" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} color="#DC2626" /> AI Fraud Detection (Live Invoice)
                  </h3>
                  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #FECACA', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Invoice #INV-2938 (Cement)</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#DC2626' }}>Risk Score: 92% (High Risk)</div>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: '#991B1B', fontWeight: 600 }}>
                      <li>Duplicate Bill detected (matched with INV-2911).</li>
                      <li>Cost Inflation: Cement rate 18% above Govt Schedule of Rates.</li>
                    </ul>
                  </div>
                  <button style={{ width: '100%', padding: '10px', background: '#DC2626', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'not-allowed' }}>
                    Payment Automatically Blocked
                  </button>
                </motion.div>

                <motion.div variants={fadeUp} className="premium-card" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} color="#F59E0B" /> Emergency Budget Request
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#92400E', marginBottom: '12px' }}>
                    Contractor requested extra funds due to unexpected underground conditions. AI verified Photos, Drone Images, and Engineer Reports.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Verified Amount</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>₹{Math.round(totalDeptBudget * 0.05)}L</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ padding: '6px 12px', background: '#10B981', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                        onClick={() => alert('Emergency funds approved.')}>Approve</button>
                      <button style={{ padding: '6px 12px', background: '#EF4444', color: 'white', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                        onClick={() => alert('Emergency request rejected.')}>Reject</button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── TAB 4: AI BUDGET LEARNING ─── */}
        {activeStage === 'learning' && (
          <motion.div key="learning" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div variants={fadeUp} className="premium-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={20} color="#8B5CF6" /> Continuous Budget Learning Engine
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                After every completed project, GovSync AI analyzes actual costs, delays, and contractor performance.
                The next time a similar project is proposed, estimates are dynamically adjusted for maximum accuracy.
              </p>

              {/* Live learning stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Projects Learned</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366F1' }}>{projects.length}</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Budget Optimized</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>₹{Math.round(totalDeptBudget * 0.15)}L</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Dept Insights</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>{DEPARTMENTS.length}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  { icon: <TrendingUp size={16} />, bg: '#DBEAFE', color: '#1D4ED8', title: 'Regional Cost Shift', text: 'Learned that central districts require ~12% more foundation material due to soil composition. Estimates auto-updated.' },
                  { icon: <Clock size={16} />, bg: '#FEF3C7', color: '#D97706', title: 'Contractor Delay Bias', text: '"Alpha Infra Corp" consistently delays by 3 weeks. AI bidding score reduced by 15 points for future tenders.' },
                  { icon: <DollarSign size={16} />, bg: '#D1FAE5', color: '#047857', title: 'Material Optimization', text: 'Learned that importing Bitumen from eastern sector reduces cost by ~4%. Tenders auto-suggest this route.' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ background: item.bg, padding: '8px', borderRadius: '8px', color: item.color }}>{item.icon}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
