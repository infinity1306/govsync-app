import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGovContext, DEPARTMENTS, getDeptById } from '../context/GovContext';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import CommandCenter from './CommandCenter';
import AIEstimationTab from './AIEstimationTab';
import AIFundOrchestrationTab from './AIFundOrchestrationTab';
import GovSyncXTab from './GovSyncXTab';
import AICoordinationEngine from './AICoordinationEngine';
import OpenDataTab from './OpenDataTab';
import {
  Network, LayoutDashboard, FolderKanban, Building2, Wallet,
  MapPin, Bell, AlertTriangle, CheckCircle2, Shield, Database,
  ArrowRight, ShieldCheck, Plus, Sparkles, LogOut, Brain, Check,
  Lock, Unlock, TrendingUp, BarChart3, PieChart, Clock,
  FileText, Upload, Camera, ChevronRight, Search,
  Zap, Eye, IndianRupee, Construction, Hammer, Truck, Scale,
  AlertCircle, Info, ChevronDown, ChevronUp, X, Activity, MessageCircle, Send,
  Sun, Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import NotificationsDropdown from '../components/NotificationsDropdown';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

// ─── SVG Progress Ring ──────────────────────────────────────────────
function ProgressRing({ percent, size = 80, stroke = 6, color = '#10B981' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      </svg>
      <span className="progress-ring-text">{percent}%</span>
    </div>
  );
}

// ─── Department Status Chip ─────────────────────────────────────────
function DeptChip({ deptId, status }) {
  const dept = getDeptById(deptId);
  if (!dept) return null;
  const statusIcons = { pending: '⏳', yes: '⚠️', completed: '✅', no: '➖' };
  return (
    <div className={`dept-chip ${status}`}>
      <div className="dept-chip-icon" style={{ background: dept.bg, color: dept.color }}>{dept.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.name}</div>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, marginTop: 1 }}>{statusIcons[status]} {status}</div>
      </div>
    </div>
  );
}

// ─── Approval Pipeline ──────────────────────────────────────────────
function ApprovalPipeline({ stages }) {
  const stageOrder = [
    { key: 'road', label: 'Road Dept' },
    { key: 'commissioner', label: 'Municipal Commissioner' },
    { key: 'finance', label: 'Finance Dept' },
    { key: 'government', label: 'Govt Approval' },
  ];
  return (
    <div className="approval-pipeline">
      {stageOrder.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="approval-stage">
            <div className={`approval-stage-dot ${stages[s.key]}`}>
              {stages[s.key] === 'approved' ? '✓' : (i + 1)}
            </div>
            <span className="approval-stage-label">{s.label}</span>
          </div>
          {i < stageOrder.length - 1 && (
            <div className={`approval-connector ${stages[s.key] === 'approved' ? 'active' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  const {
    projects, escrowFunds, aiInsights, stats,
    createProject, submitDeptResponse, setFundAllocation,
    updateDeptWorkProgress, submitCompletionVerification,
    checkAndUnlockRoad, updateRoadDepartment,
    submitAdditionalFundRequest, approveAdditionalFund, injectCapital,
    addDiscussionMessage, emergencyOverride
  } = useGovContext();

  const [activeTab, setActiveTab] = useState('govsyncx');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [expandedDiscussions, setExpandedDiscussions] = useState({});
  const [chatInputs, setChatInputs] = useState({});
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);

  // Create project form
  const [form, setForm] = useState({ name: '', ward: 'Ward 12', lat: '23.2599', lng: '77.4126', complaintType: 'Road Construction', estimatedBudget: '200', priority: 'High', expectedTimeline: 'Aug 2026 – Dec 2026', description: '', fundSource: 'Municipal Budget' });

  const handleCreateProject = (e) => {
    e.preventDefault();
    createProject(form, 'Admin');
    setForm({ name: '', ward: 'Ward 12', lat: '23.2599', lng: '77.4126', complaintType: 'Road Construction', estimatedBudget: '200', priority: 'High', expectedTimeline: 'Aug 2026 – Dec 2026', description: '', fundSource: 'Municipal Budget' });
    setActiveTab('coordination');
  };

  const handleSendAdminMessage = (projectId) => {
    const text = chatInputs[projectId];
    if (!text?.trim()) return;
    addDiscussionMessage(projectId, 'Admin / Coordinator', text);
    setChatInputs(prev => ({ ...prev, [projectId]: '' }));
  };

  const handleEmergencyOverride = (e) => {
    e.preventDefault();
    if (!selectedProject || !emergencyReason) return;
    emergencyOverride(selectedProject.id, emergencyReason);
    setIsModalOpen(false);
    setEmergencyReason('');
  };

  // Get only new-workflow projects (those with departmentStatuses)
  const coordProjects = useMemo(() => projects.filter(p => p.departmentStatuses), [projects]);

  const openModal = (type, project = null) => {
    setModalType(type);
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const groupedTabs = [
    {
      title: "Core Platform",
      items: [
        { id: 'govsyncx', label: 'GovSync X OS', icon: <Sparkles size={16} color="#8B5CF6" /> },
        { id: 'executive', label: 'Executive', icon: <BarChart3 size={16} /> },
        { id: 'map', label: 'Live Map', icon: <MapPin size={16} /> },
      ]
    },
    {
      title: "AI Intelligence",
      items: [
        { id: 'ai-engine', label: 'AI Engine', icon: <Brain size={16} /> },
        { id: 'ai-estimate', label: 'AI Estimate', icon: <Scale size={16} /> },
        { id: 'funds', label: 'AI Smart Budget', icon: <Wallet size={16} /> },
        { id: 'open-data', label: 'Open Data', icon: <Database size={16} /> },
      ]
    },
    {
      title: "Workflow & Project",
      items: [
        { id: 'create', label: 'New Project', icon: <Plus size={16} /> },
        { id: 'coordination', label: 'Coordination', icon: <FolderKanban size={16} /> },
        { id: 'ai-coordination', label: 'AI Coordination', icon: <Network size={16} /> },
        { id: 'verification', label: 'Verification', icon: <ShieldCheck size={16} /> },
      ]
    },
    {
      title: "Department Portals",
      items: [
        { id: 'departments', label: 'Departments', icon: <Building2 size={16} /> },
        { id: 'road-approval', label: 'Road Approval', icon: <Lock size={16} /> },
        { id: 'road-dept', label: 'Road Dept', icon: <Construction size={16} /> },
        { id: 'fund-requests', label: 'Fund Requests', icon: <IndianRupee size={16} /> },
      ]
    }
  ];

  return (
    <div className="premium-dashboard-layout">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="premium-sidebar">
        <div className="premium-sidebar-logo">
          <Network size={22} color="#6366F1" />
          <h2>GovSync</h2>
        </div>
        <nav className="premium-nav">
          {groupedTabs.map(group => (
            <div key={group.title} style={{ marginBottom: '12px' }}>
              <div className="premium-sidebar-section-header">
                {group.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map(t => (
                  <button key={t.id} className={`premium-nav-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <a href="/" onClick={(e) => {
            e.preventDefault();
            localStorage.removeItem('govsync_demo_profile');
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
              supabase.auth.signOut().catch(() => {}).finally(() => {
                window.location.href = '/';
              });
            } else {
              window.location.href = '/';
            }
          }} className="premium-nav-item" style={{ color: '#EF4444', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '10px' }}>
            <LogOut size={16} /> Exit Portal
          </a>
        </nav>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main className="premium-main">
        <header className="premium-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
            <MapPin size={16} color="#6366F1" /> Bhopal Municipal Coordination Hub
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationsDropdown />
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {theme === 'dark' ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#475569" />}
            </button>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>AD</div>
          </div>
        </header>

        <div className="premium-content">
          <AnimatePresence mode="wait">

            {activeTab === 'govsyncx' && (
              <GovSyncXTab key="govsyncx" />
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 1: COMMAND CENTER (GRAND FINALE)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'executive' && (
              <CommandCenter key="executive" />
            )}

            {activeTab === 'ai-estimate' && (
              <AIEstimationTab key="ai-estimate" />
            )}

            {activeTab === 'funds' && (
              <AIFundOrchestrationTab key="funds" />
            )}

            {activeTab === 'open-data' && (
              <OpenDataTab key="open-data" />
            )}

            {activeTab === 'ai-coordination' && (
              <AICoordinationEngine key="ai-coordination" />
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 2: CREATE PROJECT (Step 1)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'create' && (
              <motion.div key="create" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Generate New Project</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <motion.div variants={fadeUp} className="premium-card">
                    <form onSubmit={handleCreateProject}>
                      <div className="gov-form-group">
                        <label className="gov-form-label">Project Name *</label>
                        <input className="gov-form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g., Road Construction – Sector 7" />
                      </div>
                      <div className="gov-form-row">
                        <div className="gov-form-group">
                          <label className="gov-form-label">Area / Ward *</label>
                          <select className="gov-form-select" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))}>
                            {Array.from({ length: 20 }, (_, i) => <option key={i} value={`Ward ${i + 1}`}>Ward {i + 1}</option>)}
                          </select>
                        </div>
                        <div className="gov-form-group">
                          <label className="gov-form-label">Complaint Type</label>
                          <select className="gov-form-select" value={form.complaintType} onChange={e => setForm(f => ({ ...f, complaintType: e.target.value }))}>
                            {['Road Construction', 'Road Widening', 'Pothole Repair', 'Flyover Construction', 'Bridge Repair', 'Drainage Work'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="gov-form-row">
                        <div className="gov-form-group">
                          <label className="gov-form-label">GPS Latitude</label>
                          <input className="gov-form-input" type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} />
                        </div>
                        <div className="gov-form-group">
                          <label className="gov-form-label">GPS Longitude</label>
                          <input className="gov-form-input" type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} />
                        </div>
                      </div>
                      <div className="gov-form-row">
                        <div className="gov-form-group">
                          <label className="gov-form-label">Estimated Budget (₹ Lakhs)</label>
                          <input className="gov-form-input" type="number" value={form.estimatedBudget} onChange={e => setForm(f => ({ ...f, estimatedBudget: e.target.value }))} required />
                        </div>
                        <div className="gov-form-group">
                          <label className="gov-form-label">Priority</label>
                          <select className="gov-form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                            {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="gov-form-row">
                        <div className="gov-form-group">
                          <label className="gov-form-label">Expected Timeline</label>
                          <input className="gov-form-input" value={form.expectedTimeline} onChange={e => setForm(f => ({ ...f, expectedTimeline: e.target.value }))} placeholder="e.g., Aug 2026 – Dec 2026" />
                        </div>
                        <div className="gov-form-group">
                          <label className="gov-form-label">Fund Source (If Raised)</label>
                          <select className="gov-form-select" value={form.fundSource} onChange={e => setForm(f => ({ ...f, fundSource: e.target.value }))}>
                            {['Municipal Budget', 'State Government', 'Smart City Mission', 'Citizen Raised Fund', 'CSR Fund', 'MLA Local Area Fund'].map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="gov-form-group">
                        <label className="gov-form-label">Description</label>
                        <textarea className="gov-form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the project scope..." />
                      </div>
                      <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                        <Plus size={18} /> Generate Project & Notify All Departments
                      </button>
                    </form>
                  </motion.div>

                  {/* Preview */}
                  <motion.div variants={fadeUp}>
                    <div className="premium-card" style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white', marginBottom: 16 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 }}>Project Preview</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4, color: 'white' }}>{form.name || 'Project Name'}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: 16 }}>
                        {form.ward} · {form.complaintType} <br/>
                        <span style={{color: '#FCD34D', fontSize: '0.75rem', marginTop: 4, display: 'inline-block'}}>Fund Source: {form.fundSource}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, marginBottom: 4 }}>BUDGET</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>₹{form.estimatedBudget}L</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, marginBottom: 4 }}>PRIORITY</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: form.priority === 'Critical' ? '#EF4444' : form.priority === 'High' ? '#F59E0B' : '#10B981' }}>{form.priority}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.78rem', color: '#A5B4FC' }}>
                        📋 Status: <strong>Pending Department Approval</strong>
                      </div>
                    </div>

                    <div className="premium-card" style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Departments to Notify (12)</div>
                      <div className="dept-grid">
                        {DEPARTMENTS.map(d => (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: d.bg, fontSize: '0.72rem', fontWeight: 600, color: d.color }}>
                            <span>{d.icon}</span> {d.name.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 3: COORDINATION HUB (Steps 2-4)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'coordination' && (
              <motion.div key="coordination" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Live Coordination Dashboard</h2>

                {coordProjects.map(project => (
                  <motion.div key={project.id} variants={fadeUp} className="premium-card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{project.name}</h3>
                          <span className="premium-badge" style={{ background: project.priority === 'Critical' ? '#FEE2E2' : '#FEF3C7', color: project.priority === 'Critical' ? '#991B1B' : '#92400E' }}>{project.priority}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{project.id} · {project.ward} · Budget: ₹{project.estimatedBudget}L · <strong style={{ color: '#6366F1' }}>Initiated By: {project.raisedBy || 'Admin'}</strong></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <div className={`road-lock-badge ${project.roadConstructionUnlocked ? 'unlocked' : 'locked'}`}>
                          {project.roadConstructionUnlocked ? <><Unlock size={14} /> Road Approved</> : <><Lock size={14} /> Road LOCKED</>}
                        </div>
                        {!project.roadConstructionUnlocked && (
                          <button onClick={() => openModal('emergency', project)} className="premium-btn" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FEE2E2', fontSize: '0.75rem', padding: '6px 12px', gap: 6 }}>
                            <AlertTriangle size={12} /> Emergency Override
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Department Status Grid */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Department Responses</div>
                    <div className="dept-grid">
                      {DEPARTMENTS.map(dept => {
                        const status = project.departmentStatuses?.[dept.id];
                        if (status === 'not_applicable') return null;
                        return <DeptChip key={dept.id} deptId={dept.id} status={status || 'pending'} />;
                      })}
                    </div>

                    {/* Timeline for departments with work */}
                    {Object.keys(project.departmentWork || {}).length > 0 && (
                      <div style={{ marginTop: 16, padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Sequenced Work Timeline</div>
                        {Object.entries(project.departmentWork).map(([deptId, work]) => {
                          const dept = getDeptById(deptId);
                          return (
                            <div key={deptId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: dept?.bg, color: dept?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{dept?.icon}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dept?.name} – {work.workType}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{work.budget}L · {work.duration} · {work.startDate} → {work.completionDate}</div>
                              </div>
                              <div style={{ width: 80 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: work.progress >= 100 ? '#10B981' : '#F59E0B', textAlign: 'right', marginBottom: 4 }}>{work.progress}%</div>
                                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${work.progress}%`, background: work.progress >= 100 ? '#10B981' : dept?.color, borderRadius: 3, transition: 'width 0.5s' }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {/* Road Construction Lock */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', marginTop: 4 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: project.roadConstructionUnlocked ? '#D1FAE5' : '#FEE2E2', color: project.roadConstructionUnlocked ? '#065F46' : '#991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {project.roadConstructionUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: project.roadConstructionUnlocked ? '#065F46' : '#991B1B' }}>Road Construction</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {project.roadConstructionUnlocked ? 'Approved — All prerequisites completed' : 'LOCKED — Waiting for departments'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phase 7: Collaboration Discussion Room */}
                    <div style={{ marginTop: 16 }}>
                      <button 
                        onClick={() => setExpandedDiscussions(prev => ({ ...prev, [project.id]: !prev[project.id] }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#6366F1', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        <MessageCircle size={16} /> 
                        {expandedDiscussions[project.id] ? 'Hide Discussion Room' : `Open Discussion Room (${project.discussions?.length || 0})`}
                        {expandedDiscussions[project.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {expandedDiscussions[project.id] && (
                        <div style={{ marginTop: 12, background: '#F8FAFC', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <div style={{ maxHeight: 200, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {(!project.discussions || project.discussions.length === 0) ? (
                              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>No messages yet.</div>
                            ) : (
                              project.discussions.map(msg => (
                                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender.includes('Admin') ? 'flex-end' : 'flex-start' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{msg.sender} · {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  <div style={{ 
                                    padding: '8px 12px', borderRadius: 12, fontSize: '0.85rem',
                                    background: msg.sender.includes('Admin') ? '#6366F1' : msg.sender === 'SYSTEM' ? '#FEE2E2' : 'white',
                                    color: msg.sender.includes('Admin') ? 'white' : msg.sender === 'SYSTEM' ? '#991B1B' : 'var(--text-primary)',
                                    border: msg.sender.includes('Admin') ? 'none' : msg.sender === 'SYSTEM' ? '1px solid #FCA5A5' : '1px solid var(--border)'
                                  }}>
                                    {msg.text}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'white' }}>
                            <input 
                              type="text" 
                              placeholder="Type a message or tag a department (e.g. @Electricity)..."
                              value={chatInputs[project.id] || ''}
                              onChange={e => setChatInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleSendAdminMessage(project.id)}
                              style={{ flex: 1, border: 'none', padding: '12px 16px', fontSize: '0.85rem', outline: 'none' }}
                            />
                            <button 
                              onClick={() => handleSendAdminMessage(project.id)}
                              style={{ background: '#6366F1', color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Send size={14} /> Send
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 4: DEPARTMENT STATUS (Step 3)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'departments' && (
              <motion.div key="departments" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Department Response Panel</h2>
                <div className="dept-grid-3">
                  {DEPARTMENTS.map(dept => {
                    const responses = coordProjects.map(p => ({
                      project: p,
                      status: p.departmentStatuses?.[dept.id] || 'pending',
                      work: p.departmentWork?.[dept.id],
                    })).filter(r => r.status !== 'not_applicable');
                    const pending = responses.filter(r => r.status === 'pending').length;
                    const hasWork = responses.filter(r => r.status === 'yes').length;
                    const completed = responses.filter(r => r.status === 'completed').length;
                    return (
                      <motion.div key={dept.id} variants={fadeUp} className="premium-card premium-card-hover">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: dept.bg, color: dept.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{dept.icon}</div>
                          <div>
                            <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{dept.name}</h4>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {pending > 0 && <span style={{ color: '#F59E0B', marginRight: 8 }}>⏳ {pending} pending</span>}
                              {hasWork > 0 && <span style={{ color: '#EF4444', marginRight: 8 }}>⚠️ {hasWork} has work</span>}
                              {completed > 0 && <span style={{ color: '#10B981' }}>✅ {completed} done</span>}
                            </div>
                          </div>
                        </div>
                        {responses.filter(r => r.work).map(r => (
                          <div key={r.project.id} style={{ padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 8, fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.work.workType}</div>
                            <div style={{ color: 'var(--text-muted)' }}>
                              Budget: ₹{r.work.budget}L · Duration: {r.work.duration}
                              {r.work.excavation && <span style={{ color: '#EF4444', marginLeft: 8 }}>🚧 Excavation Required</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                              <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${r.work.progress}%`, background: dept.color, transition: 'width 0.5s' }} />
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: r.work.progress >= 100 ? '#10B981' : 'var(--text-muted)' }}>{r.work.progress}%</span>
                            </div>
                          </div>
                        ))}
                        {responses.filter(r => r.status === 'pending').length > 0 && (
                          <div style={{ padding: 8, textAlign: 'center', fontSize: '0.75rem', color: '#F59E0B', background: '#FFFBEB', borderRadius: 8 }}>
                            {pending} project(s) awaiting response
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 5: AI DECISION ENGINE (Step 5)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'ai-engine' && (
              <motion.div key="ai-engine" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Brain size={24} color="#8B5CF6" /> AI Decision Engine
                </h2>

                {coordProjects.filter(p => !p.roadConstructionUnlocked).map(project => {
                  const pendingDepts = DEPARTMENTS.filter(d => project.departmentStatuses?.[d.id] === 'yes' || project.departmentStatuses?.[d.id] === 'pending');
                  const hasBlockers = pendingDepts.length > 0;
                  return (
                    <motion.div key={project.id} variants={fadeUp} className="premium-card" style={{ marginBottom: 20, borderLeft: hasBlockers ? '4px solid #EF4444' : '4px solid #10B981' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{project.name}</h3>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{project.ward} · {project.id}</div>
                        </div>
                        {hasBlockers ? (
                          <div style={{ padding: '8px 16px', background: '#FEE2E2', color: '#991B1B', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Lock size={14} /> Road Construction Cannot Begin
                          </div>
                        ) : (
                          <div style={{ padding: '8px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} /> Ready for Road Approval
                          </div>
                        )}
                      </div>

                      {hasBlockers && (
                        <div style={{ background: '#FEF2F2', padding: 20, borderRadius: 12, border: '1px solid #FEE2E2' }}>
                          <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={16} /> Blocking Reasons:
                          </div>
                          {pendingDepts.map(dept => {
                            const work = project.departmentWork?.[dept.id];
                            return (
                              <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                                <span style={{ fontSize: '1rem' }}>{dept.icon}</span>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7F1D1D' }}>{dept.name}</span>
                                  <span style={{ fontSize: '0.8rem', color: '#991B1B', marginLeft: 8 }}>
                                    {work ? `${work.workType} – ${work.progress}% complete` : 'Response Pending'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {/* Estimated Delay */}
                          <div style={{ marginTop: 16, padding: 12, background: '#FEF3C7', borderRadius: 8, border: '1px solid #FCD34D' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E' }}>
                              ⏱️ Estimated Delay: {pendingDepts.length * 5} Days
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: 4 }}>
                              Road department receives no approval until all departments complete work.
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 7: VERIFICATION CENTER (Step 8)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'verification' && (
              <motion.div key="verification" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Completion Verification Center</h2>

                {coordProjects.map(project => {
                  const verifiedDepts = Object.keys(project.completionVerification || {});
                  if (verifiedDepts.length === 0 && !Object.values(project.departmentStatuses || {}).some(s => s === 'completed')) return null;
                  return (
                    <motion.div key={project.id} variants={fadeUp} className="premium-card" style={{ marginBottom: 20 }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4 }}>{project.name}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>{project.ward} · {project.id}</div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {DEPARTMENTS.filter(d => project.departmentStatuses?.[d.id] === 'completed' || project.completionVerification?.[d.id]).map(dept => {
                          const v = project.completionVerification?.[dept.id] || {};
                          const items = [
                            { label: 'Geo-tagged Photos', checked: v.geoPhotos },
                            { label: 'Before/After Images', checked: v.beforeAfter },
                            { label: 'Completion Certificate', checked: v.certificate },
                            { label: 'Engineer Approval', checked: v.engineerApproval },
                          ];
                          const allChecked = items.every(i => i.checked);
                          return (
                            <div key={dept.id} style={{ padding: 16, background: allChecked ? '#F0FDF4' : 'var(--bg)', borderRadius: 12, border: `1px solid ${allChecked ? '#4ADE80' : 'var(--border)'}` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span>{dept.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{dept.name}</span>
                                {allChecked && <CheckCircle2 size={16} color="#10B981" style={{ marginLeft: 'auto' }} />}
                              </div>
                              <div className="verification-checklist">
                                {items.map((item, i) => (
                                  <div key={i} className={`verification-item ${item.checked ? 'checked' : ''}`}>
                                    <div className={`verification-check ${item.checked ? 'checked' : ''}`}>
                                      {item.checked ? '✓' : ''}
                                    </div>
                                    <span style={{ fontSize: '0.78rem' }}>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                              {!allChecked && (
                                <button className="premium-btn" style={{ width: '100%', marginTop: 10, background: dept.color, color: 'white', padding: '8px 12px', fontSize: '0.78rem' }}
                                  onClick={() => submitCompletionVerification(project.id, dept.id, { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true })}>
                                  <Camera size={14} /> Verify & Approve
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 8: ROAD APPROVAL (Step 9)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'road-approval' && (
              <motion.div key="road-approval" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Road Construction Approval</h2>

                {coordProjects.map(project => {
                  const deptChecks = DEPARTMENTS.map(d => ({
                    ...d,
                    status: project.departmentStatuses?.[d.id] || 'pending',
                    clear: project.departmentStatuses?.[d.id] === 'completed' || project.departmentStatuses?.[d.id] === 'no',
                  }));
                  const allClear = deptChecks.every(d => d.clear);

                  return (
                    <motion.div key={project.id} variants={fadeUp} className="premium-card" style={{ marginBottom: 24 }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{project.name}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>{project.ward} · Road Budget: ₹{project.fundAllocations?.road || project.estimatedBudget}L</div>

                      {/* Department Checklist */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                        {deptChecks.map(d => (
                          <div key={d.id} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10,
                            background: d.clear ? '#F0FDF4' : '#FEF2F2',
                            border: `1px solid ${d.clear ? '#4ADE80' : '#FCA5A5'}`,
                          }}>
                            <span style={{ fontSize: '1rem' }}>{d.clear ? '✔' : '✘'}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: d.clear ? '#166534' : '#991B1B' }}>{d.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>

                      {/* Approval Status */}
                      {allClear && !project.roadConstructionUnlocked && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{ textAlign: 'center', padding: 32 }}
                        >
                          <button className="premium-btn" onClick={() => checkAndUnlockRoad(project.id)}
                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', padding: '16px 40px', fontSize: '1.1rem', borderRadius: 16 }}>
                            <Unlock size={22} /> Unlock Road Construction
                          </button>
                        </motion.div>
                      )}

                      {project.roadConstructionUnlocked && (
                        <motion.div
                          className="unlock-animation"
                          style={{ textAlign: 'center', padding: 32, background: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)', borderRadius: 16, border: '2px solid #10B981', position: 'relative', overflow: 'hidden' }}
                        >
                          <div className="unlock-pulse" style={{ width: 80, height: 80, borderRadius: '50%', background: '#10B981', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={40} color="white" />
                          </div>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065F46', marginBottom: 8 }}>🎉 Road Construction Approved!</h3>
                          <p style={{ color: '#166534', fontSize: '0.95rem' }}>All prerequisite department work has been verified and completed.</p>
                          <button className="premium-btn" onClick={() => setActiveTab('road-dept')} style={{ marginTop: 20, background: '#065F46', color: 'white', padding: '12px 32px' }}>
                            <Construction size={18} /> Go to Road Department →
                          </button>
                        </motion.div>
                      )}

                      {!allClear && (
                        <div style={{ textAlign: 'center', padding: 24, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FEE2E2' }}>
                          <Lock size={32} color="#EF4444" style={{ margin: '0 auto 12px' }} />
                          <h4 style={{ color: '#991B1B', fontWeight: 800, marginBottom: 4 }}>Road Construction LOCKED</h4>
                          <p style={{ fontSize: '0.85rem', color: '#B91C1C' }}>{deptChecks.filter(d => !d.clear).length} department(s) still have pending work</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 9: ROAD DEPARTMENT (Step 10)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'road-dept' && (
              <motion.div key="road-dept" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Construction size={24} color="#B45309" /> Road Department Workflow
                </h2>

                {coordProjects.filter(p => p.roadConstructionUnlocked && p.roadDepartment).map(project => {
                  const rd = project.roadDepartment;
                  return (
                    <motion.div key={project.id} variants={fadeUp} className="premium-card" style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{project.name}</h3>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{project.ward} · Contractor: {rd.contractor}</div>
                        </div>
                        <div style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: 12, color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                          ₹{rd.approvedBudget}L <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>Released</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                        <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Budget</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284C7' }}>₹{rd.approvedBudget}L</div>
                        </div>
                        <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Used</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>₹{rd.usedBudget}L</div>
                        </div>
                        <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Remaining</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>₹{rd.approvedBudget - rd.usedBudget}L</div>
                        </div>
                        <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
                          <ProgressRing percent={rd.progress} size={60} stroke={5} color="#B45309" />
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>Current Phase: {rd.milestone}</div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${rd.progress}%` }} transition={{ duration: 1 }}
                          style={{ height: '100%', background: 'linear-gradient(90deg, #F59E0B, #10B981)', borderRadius: 4 }} />
                      </div>

                      {/* Uploads */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {[
                          { label: 'DPR', icon: <FileText size={18} />, done: rd.dprUploaded, color: '#6366F1' },
                          { label: 'Progress Photos', icon: <Camera size={18} />, done: rd.progressPhotos > 0, count: rd.progressPhotos, color: '#10B981' },
                          { label: 'Drone Images', icon: <Eye size={18} />, done: rd.droneImages > 0, count: rd.droneImages, color: '#0284C7' },
                          { label: 'Completion', icon: <CheckCircle2 size={18} />, done: rd.progress >= 100, color: '#10B981' },
                        ].map((item, i) => (
                          <div key={i} style={{ padding: 16, background: item.done ? '#F0FDF4' : 'var(--bg)', borderRadius: 12, border: `1px solid ${item.done ? '#4ADE80' : 'var(--border)'}`, textAlign: 'center' }}>
                            <div style={{ color: item.done ? item.color : 'var(--text-muted)', marginBottom: 8 }}>{item.icon}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{item.label}</div>
                            {item.count !== undefined && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.count} uploaded</div>}
                            {item.done && <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 700, marginTop: 4 }}>✓ Done</div>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {coordProjects.filter(p => p.roadConstructionUnlocked && p.roadDepartment).length === 0 && (
                  <div className="premium-card" style={{ textAlign: 'center', padding: 48 }}>
                    <Lock size={48} color="#94A3B8" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                    <h3 style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>No Active Road Construction</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Road department work begins only after all departments complete prerequisites.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 10: FUND REQUESTS (Step 11)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'fund-requests' && (
              <motion.div key="fund-requests" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Additional Fund Requests</h2>

                {coordProjects.filter(p => p.additionalFundRequests?.length > 0).map(project => (
                  <motion.div key={project.id} variants={fadeUp} className="premium-card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 16 }}>{project.name}</h3>

                    {project.additionalFundRequests.map(req => (
                      <div key={req.id} style={{ padding: 20, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Original Budget</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹{req.originalBudget}L</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Used</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>₹{req.usedBudget}L</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Additional Required</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EF4444' }}>₹{req.additionalRequired}L</div>
                          </div>
                        </div>

                        <div style={{ padding: 12, background: '#FEF3C7', borderRadius: 10, border: '1px solid #FCD34D', marginBottom: 16, fontSize: '0.85rem', color: '#92400E' }}>
                          <strong>Reason:</strong> {req.reason}
                        </div>

                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Approval Pipeline</div>
                        <ApprovalPipeline stages={req.stages} />

                        {/* Approve buttons */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          {['commissioner', 'finance', 'government'].map(stage => {
                            const stageLabels = { commissioner: 'Commissioner', finance: 'Finance', government: 'Government' };
                            const prevStage = stage === 'commissioner' ? 'road' : stage === 'finance' ? 'commissioner' : 'finance';
                            const canApprove = req.stages[prevStage] === 'approved' && req.stages[stage] === 'pending';
                            return canApprove ? (
                              <button key={stage} className="premium-btn" onClick={() => approveAdditionalFund(project.id, req.id, stage)}
                                style={{ background: '#10B981', color: 'white', padding: '8px 16px', fontSize: '0.78rem' }}>
                                <Check size={14} /> Approve ({stageLabels[stage]})
                              </button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))}

                {coordProjects.every(p => !p.additionalFundRequests?.length) && (
                  <div className="premium-card" style={{ textAlign: 'center', padding: 48 }}>
                    <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                    <h3 style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No Pending Fund Requests</h3>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 11: AI INSIGHTS (Step 12)
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'ai-insights' && (
              <motion.div key="ai-insights" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={24} color="#8B5CF6" /> AI Recommendations & Insights
                </h2>

                {aiInsights.length === 0 && (
                  <div className="premium-card" style={{ textAlign: 'center', padding: 48 }}>
                    <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#166534', fontWeight: 800, marginBottom: 8 }}>All Systems Nominal</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No anomalies, duplicates, or fraud indicators detected.</p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {aiInsights.map(insight => {
                    const severityColors = { high: '#EF4444', medium: '#F59E0B', low: '#3B82F6' };
                    const typeIcons = { warning: <AlertTriangle size={20} />, caution: <AlertCircle size={20} />, alert: <Zap size={20} />, info: <Info size={20} /> };
                    return (
                      <motion.div key={insight.id} variants={fadeUp} className={`ai-insight-card ${insight.type}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: severityColors[insight.severity] }}>
                            {typeIcons[insight.type]}
                            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>{insight.title}</h4>
                          </div>
                          <span className="premium-badge" style={{ background: `${severityColors[insight.severity]}15`, color: severityColors[insight.severity] }}>
                            {insight.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{insight.message}</p>
                        <div style={{ padding: 12, background: 'rgba(99,102,241,0.05)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.1)', fontSize: '0.82rem', color: '#6366F1' }}>
                          <strong>💡 Recommendation:</strong> {insight.recommendation}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 12: LIVE MAP
                ═══════════════════════════════════════════════════════ */}
            {activeTab === 'map' && (
              <motion.div key="map" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>City Project Map</h2>
                <div className="premium-card" style={{ position: 'relative', height: '600px', padding: 0, overflow: 'hidden', borderRadius: 16 }}>
                  {/* Heatmap Toggle Controls - TOP CORNER */}
                  <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 400, display: 'flex', gap: 10 }}>
                    <button 
                      onClick={() => setIsHeatmapMode(!isHeatmapMode)}
                      style={{
                        background: isHeatmapMode ? '#EF4444' : 'var(--card-bg)',
                        color: isHeatmapMode ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Activity size={16} /> {isHeatmapMode ? 'Disable Heatmap' : 'Enable Heatmap'}
                    </button>
                  </div>

                  {theme === 'dark' && (
                    <style>{`
                      .dark-map .leaflet-tile {
                        filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                      }
                    `}</style>
                  )}

                  <MapContainer 
                    center={[23.2599, 77.4126]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    className={theme === 'dark' ? 'dark-map' : ''}
                  >
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                      attribution='&copy; Google Maps'
                    />
                    {coordProjects.map(p => {
                      if (!p.gpsLocation?.lat || !p.gpsLocation?.lng) return null;
                      const completedCount = DEPARTMENTS.filter(d => p.departmentStatuses?.[d.id] === 'completed' || p.departmentStatuses?.[d.id] === 'no').length;
                      return (
                        <Marker key={p.id} position={[p.gpsLocation.lat, p.gpsLocation.lng]}>
                          <Popup>
                            <div style={{ fontFamily: '"Inter", sans-serif', minWidth: 220 }}>
                              <strong style={{ fontSize: '1rem', color: '#1E293B' }}>{p.name}</strong><br />
                              <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{p.ward} · {p.complaintType}</span><br />
                              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                <span style={{ padding: '3px 8px', background: p.roadConstructionUnlocked ? '#D1FAE5' : '#FEF3C7', color: p.roadConstructionUnlocked ? '#065F46' : '#92400E', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                                  {p.roadConstructionUnlocked ? '✅ Road Approved' : `⏳ ${completedCount}/12 Depts`}
                                </span>
                              </div>
                              <div style={{ marginTop: 8, fontSize: '0.82rem' }}>
                                <strong>Budget:</strong> ₹{p.estimatedBudget}L<br />
                                <strong>Timeline:</strong> {p.expectedTimeline}
                              </div>
                              {/* Phase 9 Mock utility lines around the project */}
                              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Nearby Utilities</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                  {Object.entries(p.departmentStatuses || {}).filter(([_, s]) => s !== 'not_applicable').slice(0, 6).map(([deptId, _]) => {
                                    const dept = getDeptById(deptId);
                                    return (
                                      <div key={deptId} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                                        <div style={{ width: 12, height: 4, background: dept?.color, borderRadius: 2 }} />
                                        {dept?.name}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}

                    {/* Render Heatmap circles if enabled */}
                    {isHeatmapMode && coordProjects.map(p => {
                      if (!p.gpsLocation?.lat || !p.gpsLocation?.lng) return null;
                      return (
                        <Circle
                          key={`heat-${p.id}`}
                          center={[p.gpsLocation.lat, p.gpsLocation.lng]}
                          radius={1200}
                          pathOptions={{
                            fillColor: '#EF4444',
                            fillOpacity: 0.22,
                            stroke: false
                          }}
                        />
                      );
                    })}
                  </MapContainer>
                  
                  {/* Map Legend */}
                  <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 400, background: 'var(--card-bg)', padding: 16, borderRadius: 12, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', color: 'var(--text-primary)' }}>Utility Layers</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {DEPARTMENTS.slice(0, 6).map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <div style={{ width: 14, height: 4, background: d.color, borderRadius: 2 }} /> {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Emergency Override Modal */}
      <Modal isOpen={isModalOpen && modalType === 'emergency'} onClose={() => setIsModalOpen(false)} title="🚨 Emergency Override">
        <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FCA5A5', color: '#991B1B', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', marginBottom: 4 }}>WARNING: Force Unlocking Road Construction</strong>
            <p style={{ margin: 0 }}>This action bypasses all pending department approvals and forces the project into the "Road Approved" state. This should only be used for severe emergencies (e.g. Floods, Gas Leaks, Disaster Recovery).</p>
          </div>
        </div>
        <form onSubmit={handleEmergencyOverride}>
          <div className="gov-form-group">
            <label className="gov-form-label">Reason for Emergency Override *</label>
            <textarea 
              className="gov-form-textarea" 
              rows={4}
              value={emergencyReason} 
              onChange={e => setEmergencyReason(e.target.value)} 
              required 
              placeholder="Provide a detailed justification for forcing this project through without all department clearances..." 
            />
          </div>
          <button type="submit" className="premium-btn" style={{ width: '100%', padding: '12px', background: '#DC2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none' }}>
            <Unlock size={16} /> Execute Emergency Override
          </button>
        </form>
      </Modal>
    </div>
  );
}
