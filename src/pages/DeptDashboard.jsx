import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGovContext, DEPARTMENTS, getDeptById, PROJECT_TYPES } from '../context/GovContext';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import {
  Network, LayoutDashboard, FolderKanban, Bell, Plus,
  MapPin, PlusCircle, CheckCircle2, CheckCircle, ChevronRight, Activity, Zap, ShieldAlert,
  AlertTriangle, Clock, ArrowRight, TrendingDown, Users, FileText, Send,
  LogOut, Brain, Coins, ShieldCheck, Camera, Upload, Check, X,
  BarChart3, Calendar, Info, MessageCircle, ChevronUp, ChevronDown, Search,
  Sun, Moon
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import NotificationsDropdown from '../components/NotificationsDropdown';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DeptDashboard() {
  const { theme, toggleTheme } = useTheme();
  const { deptId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Coordination Response State
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedCoordProject, setSelectedCoordProject] = useState(null);
  
  // Form fields for department response
  const [responseType, setResponseType] = useState('yes'); // yes | no | completed
  const [workType, setWorkType] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [excavation, setExcavation] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Update progress modal state
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedProgressProject, setSelectedProgressProject] = useState(null);
  const [tempProgress, setTempProgress] = useState(0);

  // Upload/Verification modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedVerifyProject, setSelectedVerifyProject] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    geoPhotos: false,
    beforeAfter: false,
    certificate: false,
    engineerApproval: false
  });

  const [expandedDiscussions, setExpandedDiscussions] = useState({});
  const [chatInputs, setChatInputs] = useState({});

  const {
    projects,
    aiInsights,
    submitDeptResponse,
    updateDeptWorkProgress,
    submitCompletionVerification,
    updateFundUtilization,
    setFundAllocation,
    addDiscussionMessage,
    createProject
  } = useGovContext();

  const resolvedDeptId = useMemo(() => {
    return deptId === 'pwd' ? 'municipality' : deptId;
  }, [deptId]);

  const config = useMemo(() => {
    return DEPARTMENTS.find(d => d.id === resolvedDeptId) || DEPARTMENTS[0];
  }, [resolvedDeptId]);

  const deptKey = config.id;
  const deptName = deptId === 'pwd' ? 'PWD' : config.name;
  const deptIcon = deptId === 'pwd' ? '🚧' : config.icon;
  const headerColor = config.color;

  // Filter allowed project types dynamically based on department
  const allowedTypes = useMemo(() => {
    const getAllowedProjectTypesForDept = (dId) => {
      switch (dId) {
        case 'water':
          return ['Water Pipeline'];
        case 'sewerage':
          return ['Sewer'];
        case 'drainage':
          return ['Drainage'];
        case 'electricity':
          return ['Electricity', 'Street Lighting'];
        case 'gas':
          return ['Gas Pipeline'];
        case 'fiber':
        case 'telecom':
          return ['Telecom Fiber'];
        case 'smartcity':
          return ['Smart City', 'Metro'];
        case 'municipality':
          return ['Road', 'Highway', 'Bridge', 'Flyover', 'Underpass', 'Footpath'];
        default:
          return PROJECT_TYPES.map(pt => pt.name);
      }
    };
    const list = getAllowedProjectTypesForDept(deptKey);
    return PROJECT_TYPES.filter(pt => list.includes(pt.name));
  }, [deptKey]);

  // New Project form state
  const [newProjectForm, setNewProjectForm] = useState({
    name: '', ward: 'Ward 12', lat: '23.2599', lng: '77.4126',
    complaintType: '', estimatedBudget: '100',
    priority: 'High', expectedTimeline: '', description: ''
  });

  useEffect(() => {
    if (allowedTypes.length > 0) {
      setNewProjectForm(prev => ({ ...prev, complaintType: allowedTypes[0].name }));
    }
  }, [allowedTypes]);

  const [projectCreated, setProjectCreated] = useState(false);

  const handleCreateNewProject = (e) => {
    e.preventDefault();
    createProject(newProjectForm, deptKey);
    setNewProjectForm({
      name: '', ward: 'Ward 12', lat: '23.2599', lng: '77.4126',
      complaintType: allowedTypes[0]?.name || 'Road', estimatedBudget: '100',
      priority: 'High', expectedTimeline: '', description: ''
    });
    setProjectCreated(true);
    setTimeout(() => setProjectCreated(false), 4000);
  };

  // Filter projects relative to this department
  const myProjectsWithWork = useMemo(() => {
    return projects.filter(p => p.departmentStatuses?.[deptKey] === 'yes' || p.departmentStatuses?.[deptKey] === 'completed');
  }, [projects, deptKey]);

  const pendingCoordinationProjects = useMemo(() => {
    return projects.filter(p => p.departmentStatuses?.[deptKey] === 'pending');
  }, [projects, deptKey]);

  const myWarnings = useMemo(() => {
    return aiInsights.filter(insight => insight.projects.some(pid => 
      projects.find(p => p.id === pid)?.departmentStatuses?.[deptKey] === 'yes'
    ));
  }, [aiInsights, projects, deptKey]);

  // Stats calculation
  const stats = useMemo(() => {
    const activeTasks = myProjectsWithWork.filter(p => p.departmentWork?.[deptKey]?.progress < 100).length;
    const completedTasks = myProjectsWithWork.filter(p => p.departmentWork?.[deptKey]?.progress >= 100).length;
    const totalAllocated = myProjectsWithWork.reduce((sum, p) => sum + (p.fundAllocations?.[deptKey] || 0), 0);
    const totalUsed = myProjectsWithWork.reduce((sum, p) => sum + (p.fundUtilization?.[deptKey]?.used || 0), 0);

    return {
      activeTasks,
      completedTasks,
      pendingResponses: pendingCoordinationProjects.length,
      totalAllocated,
      totalUsed,
      conflicts: myWarnings.length
    };
  }, [myProjectsWithWork, pendingCoordinationProjects, myWarnings, deptKey]);

  const handleOpenResponse = (project) => {
    setSelectedCoordProject(project);
    setResponseType('yes');
    setWorkType('');
    setBudget('');
    setDuration('');
    
    // Default to today and a month from now to prevent weird dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    setStartDate(today.toISOString().split('T')[0]);
    setCompletionDate(nextMonth.toISOString().split('T')[0]);
    
    setExcavation(false);
    setRemarks('');
    setIsResponseModalOpen(true);
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    if (!selectedCoordProject) return;

    if (responseType === 'yes') {
      const workDetails = {
        workType,
        budget: parseFloat(budget) || 0,
        duration: duration || '10 Days',
        startDate: startDate || new Date().toISOString().split('T')[0],
        completionDate: completionDate || new Date().toISOString().split('T')[0],
        excavation,
        remarks
      };
      submitDeptResponse(selectedCoordProject.id, deptKey, 'yes', workDetails);
      // Auto-set initial allocation in local mock state to match the requested budget
      setFundAllocation(selectedCoordProject.id, { [deptKey]: parseFloat(budget) || 0 });
    } else {
      submitDeptResponse(selectedCoordProject.id, deptKey, responseType);
    }
    setIsResponseModalOpen(false);
  };

  const handleOpenProgress = (project) => {
    setSelectedProgressProject(project);
    setTempProgress(project.departmentWork?.[deptKey]?.progress || 0);
    setIsProgressModalOpen(true);
  };

  const handleUpdateProgress = (e) => {
    e.preventDefault();
    if (!selectedProgressProject) return;
    updateDeptWorkProgress(selectedProgressProject.id, deptKey, tempProgress);
    
    // Simulate updating utilized budget proportionally
    const allocation = selectedProgressProject.fundAllocations?.[deptKey] || 0;
    const simulatedUsed = Math.round((tempProgress / 100) * allocation * 10) / 10;
    updateFundUtilization(selectedProgressProject.id, deptKey, { used: simulatedUsed });

    setIsProgressModalOpen(false);
  };

  const handleOpenVerify = (project) => {
    setSelectedVerifyProject(project);
    setVerificationForm({
      geoPhotos: false,
      beforeAfter: false,
      certificate: false,
      engineerApproval: false
    });
    setIsVerifyModalOpen(true);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!selectedVerifyProject) return;
    submitCompletionVerification(selectedVerifyProject.id, deptKey, verificationForm);
    setIsVerifyModalOpen(false);
  };

  const handleSendDeptMessage = (projectId) => {
    const text = chatInputs[projectId];
    if (!text?.trim()) return;
    addDiscussionMessage(projectId, deptName, text);
    setChatInputs(prev => ({ ...prev, [projectId]: '' }));
  };

  return (
    <div className="premium-dashboard-layout">
      {/* SIDEBAR */}
      <aside className="premium-sidebar">
        <div className="premium-sidebar-logo">
          <span style={{ fontSize: '1.25rem' }}>{deptIcon}</span>
          <h2>GovSync</h2>
        </div>
        <div style={{ padding: '0 24px', marginBottom: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {deptName} Portal
        </div>
        <nav className="premium-nav">
          <button className={`premium-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> My Dashboard
          </button>
          <button className={`premium-nav-item ${activeTab === 'new-project' ? 'active' : ''}`} onClick={() => setActiveTab('new-project')}>
            <Plus size={18} /> New Project
          </button>
          <button className={`premium-nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <FolderKanban size={18} /> My Operations
          </button>
          <button className={`premium-nav-item ${activeTab === 'coordination' ? 'active' : ''}`} onClick={() => setActiveTab('coordination')}>
            <Users size={18} /> Coordination Hub
            {stats.pendingResponses > 0 && <span style={{ background: headerColor, color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>{stats.pendingResponses}</span>}
          </button>
          <button className={`premium-nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
            <Bell size={18} /> Conflict Alerts
            {stats.conflicts > 0 && <span style={{ background: '#EF4444', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>{stats.conflicts}</span>}
          </button>
          <div style={{ flex: 1 }}></div>
          <Link to={`/dashboard/ai-advisor?dept=${deptId}`} className="premium-nav-item" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.15)', color: '#A855F7', marginBottom: '10px' }}>
            <Brain size={18} /> AI Advisor ✨
          </Link>
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
          }} className="premium-nav-item" style={{ color: '#EF4444' }}>
            <LogOut size={18} /> Exit Portal
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="premium-main">
        <header className="premium-header">
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Welcome back, {deptName} Exec</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Secure Infrastructure & utility maintenance coordination</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          </div>
        </header>

        <div className="premium-content">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-kpi-grid">
                  <motion.div variants={fadeUp} className="premium-card premium-card-hover" style={{ borderLeft: `4px solid ${headerColor}` }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Active Operations</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.activeTasks}</div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="premium-card premium-card-hover" style={{ borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Pending Proposals</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.pendingResponses}</div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="premium-card premium-card-hover" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Funds Released</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{stats.totalAllocated}L</div>
                  </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                  <motion.div variants={fadeUp} className="premium-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Ongoing Works</h3>
                    {myProjectsWithWork.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No active department operations found.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {myProjectsWithWork.slice(0, 5).map(project => {
                          const work = project.departmentWork?.[deptKey];
                          return (
                            <div key={project.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{work?.workType || project.name}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.id} • Ward: {project.ward} • <strong>Initiated By: {project.raisedBy || 'Admin'}</strong></p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="premium-badge" style={{ background: work?.progress >= 100 ? '#D1FAE5' : '#FEF3C7', color: work?.progress >= 100 ? '#065F46' : '#92400E', marginBottom: 4 }}>
                                  {work?.progress >= 100 ? 'Execution Done' : `Progress: ${work?.progress || 0}%`}
                                </span>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget: ₹{project.fundAllocations?.[deptKey] || 0}L</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  <motion.div variants={fadeUp} className="premium-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Pending Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pendingCoordinationProjects.length === 0 ? (
                        <div style={{ color: '#166534', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                          <CheckCircle size={28} />
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>All Clear! No pending proposals.</span>
                        </div>
                      ) : (
                        pendingCoordinationProjects.slice(0, 3).map(p => (
                          <div key={p.id} style={{ padding: '14px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E', marginBottom: 4 }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#B45309', marginBottom: 8 }}>{p.ward} · Proposed: {p.expectedTimeline}</div>
                            <button onClick={() => handleOpenResponse(p)} className="premium-btn" style={{ background: '#F59E0B', color: 'white', width: '100%', padding: '8px', fontSize: '0.8rem' }}>
                              Respond Now
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* NEW PROJECT TAB */}
            {activeTab === 'new-project' && (
              <motion.div key="new-project" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: '#6366f1' }}>
                      <Plus size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Initiate New Project</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create a new infrastructure project. This will automatically trigger the AI Coordination Engine.</p>
                    </div>
                  </div>

                  {projectCreated && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', background: '#D1FAE5', color: '#065F46', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #34D399' }}>
                      <CheckCircle size={20} />
                      <span style={{ fontWeight: 600 }}>Project successfully created and coordination workflow initiated!</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleCreateNewProject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="premium-input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Project Name</label>
                      <input 
                        required 
                        value={newProjectForm.name} 
                        onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} 
                        className="premium-input" 
                        placeholder="e.g. Pipeline Replacement Phase 2" 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    
                    <div className="premium-input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Project Type</label>
                      <select 
                        required 
                        value={newProjectForm.complaintType} 
                        onChange={e => setNewProjectForm({...newProjectForm, complaintType: e.target.value})} 
                        className="premium-input"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                      >
                        {allowedTypes.map(pt => <option key={pt.id} value={pt.name}>{pt.name}</option>)}
                      </select>
                    </div>

                    <div className="premium-input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Location (Ward)</label>
                      <select 
                        required 
                        value={newProjectForm.ward} 
                        onChange={e => setNewProjectForm({...newProjectForm, ward: e.target.value})} 
                        className="premium-input"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                      >
                        {['Ward 1', 'Ward 2', 'Ward 5', 'Ward 8', 'Ward 10', 'Ward 12', 'Ward 15', 'Ward 20'].map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>

                    <div className="premium-input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Expected Timeline (Start Date)</label>
                      <input 
                        type="date" 
                        required 
                        value={newProjectForm.expectedTimeline} 
                        onChange={e => setNewProjectForm({...newProjectForm, expectedTimeline: e.target.value})} 
                        className="premium-input" 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="premium-input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Estimated Budget (in Lakhs)</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        value={newProjectForm.estimatedBudget} 
                        onChange={e => setNewProjectForm({...newProjectForm, estimatedBudget: e.target.value})} 
                        className="premium-input" 
                        placeholder="100" 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="premium-input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Priority</label>
                      <select 
                        required 
                        value={newProjectForm.priority} 
                        onChange={e => setNewProjectForm({...newProjectForm, priority: e.target.value})} 
                        className="premium-input"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    
                    <div className="premium-input-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Project Description & Reason</label>
                      <textarea 
                        required 
                        rows={3}
                        value={newProjectForm.description} 
                        onChange={e => setNewProjectForm({...newProjectForm, description: e.target.value})} 
                        className="premium-input" 
                        placeholder="Detailed description of the proposed work..." 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                      <button type="submit" className="premium-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <Plus size={20} /> Create Project & Start Coordination
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* MY OPERATIONS TAB */}
            {activeTab === 'projects' && (
              <motion.div key="projects" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>All Ongoing {deptName} Operations</h3>
                  {myProjectsWithWork.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px' }}>No ongoing utility operations found. Respond "Yes" to proposals to schedule work.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myProjectsWithWork.map(project => {
                        const work = project.departmentWork?.[deptKey];
                        const allocation = project.fundAllocations?.[deptKey] || 0;
                        const utilization = project.fundUtilization?.[deptKey] || { used: 0, invoices: 0, photos: 0 };
                        const verified = project.completionVerification?.[deptKey]?.verified;

                        return (
                          <div key={project.id} style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                              <div>
                                <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{work?.workType || project.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  Project Node: <span style={{ fontWeight: 600 }}>{project.name} ({project.id})</span> · Ward: <span style={{ fontWeight: 600 }}>{project.ward}</span> · <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Initiated By: {project.raisedBy || 'Admin'}</span>
                                </p>
                              </div>
                              <span className="premium-badge" style={{ background: verified ? '#D1FAE5' : work?.progress >= 100 ? '#FEF3C7' : '#E0F2FE', color: verified ? '#065F46' : work?.progress >= 100 ? '#B45309' : '#0369A1' }}>
                                {verified ? 'Verified & Completed' : work?.progress >= 100 ? 'Verification Pending' : 'Execution Active'}
                              </span>
                            </div>

                            {/* Fund release stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: 'var(--bg)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Allocated Escrow Budget</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284C7' }}>₹{allocation} Lakh</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Funds Utilized (Used)</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>₹{utilization.used} Lakh</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Remaining Funds</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>₹{allocation - utilization.used} Lakh</div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                                <span>Operation Progress: {work?.progress || 0}%</span>
                                <span>Target Completion: {work?.completionDate}</span>
                              </div>
                              <div style={{ width: '100%', background: '#F1F5F9', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${work?.progress || 0}%`, background: headerColor, transition: 'width 0.8s ease-out' }} />
                              </div>
                            </div>

                            {/* Action items */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                              {(!work?.progress || work.progress < 100) && (
                                <button onClick={() => handleOpenProgress(project)} className="premium-btn" style={{ background: '#0F172A', color: 'white' }}>
                                  Update Work Progress
                                </button>
                              )}
                              {work?.progress >= 100 && !verified && (
                                <button onClick={() => handleOpenVerify(project)} className="premium-btn" style={{ background: '#10B981', color: 'white' }}>
                                  <ShieldCheck size={16} /> Submit Completion Verification
                                </button>
                              )}
                              {verified && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>
                                  <CheckCircle2 size={16} /> Prerequisite Work Fully Cleared
                                </div>
                              )}
                            </div>

                            {/* Phase 7: Collaboration Discussion Room */}
                            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                              <button 
                                onClick={() => setExpandedDiscussions(prev => ({ ...prev, [project.id]: !prev[project.id] }))}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: headerColor, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
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
                                      project.discussions.map(msg => {
                                        const isMe = msg.sender === deptName;
                                        return (
                                          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{msg.sender} · {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <div style={{ 
                                              padding: '8px 12px', borderRadius: 12, fontSize: '0.85rem',
                                              background: isMe ? headerColor : msg.sender === 'SYSTEM' ? '#FEE2E2' : 'white',
                                              color: isMe ? 'white' : msg.sender === 'SYSTEM' ? '#991B1B' : 'var(--text-primary)',
                                              border: isMe ? 'none' : msg.sender === 'SYSTEM' ? '1px solid #FCA5A5' : '1px solid var(--border)'
                                            }}>
                                              {msg.text}
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'white' }}>
                                    <input 
                                      type="text" 
                                      placeholder="Type a message or tag a department (e.g. @Electricity)..."
                                      value={chatInputs[project.id] || ''}
                                      onChange={e => setChatInputs(prev => ({ ...prev, [project.id]: e.target.value }))}
                                      onKeyDown={e => e.key === 'Enter' && handleSendDeptMessage(project.id)}
                                      style={{ flex: 1, border: 'none', padding: '12px 16px', fontSize: '0.85rem', outline: 'none' }}
                                    />
                                    <button 
                                      onClick={() => handleSendDeptMessage(project.id)}
                                      style={{ background: headerColor, color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                      <Send size={14} /> Send
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* COORDINATION HUB TAB */}
            {activeTab === 'coordination' && (
              <motion.div key="coordination" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Pending Road Projects Coordination</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Analyze upcoming road construction proposals in your jurisdiction. Respond with your timeline and utility installation details to prevent future repeated road digging.</p>
                  
                  {pendingCoordinationProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <CheckCircle2 size={48} style={{ color: '#10B981', margin: '0 auto 16px' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>All projects cleared. No pending coordinate requests.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {pendingCoordinationProjects.map(project => (
                        <div key={project.id} style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'inline-block', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '12px' }}>
                              PROPOSED ROAD DEVELOPMENT
                            </div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{project.name}</h4>
                            <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '0.85rem', marginBottom: '16px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {project.ward}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {project.expectedTimeline}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Coins size={14} /> Est. Budget: ₹{project.estimatedBudget}L</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}><strong>Description:</strong> {project.description || 'No description provided.'}</p>
                          </div>
                          <button onClick={() => handleOpenResponse(project)} className="premium-btn" style={{ background: headerColor, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={16} /> Respond to Proposal
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CONFLICT ALERTS TAB */}
            {activeTab === 'alerts' && (
              <motion.div key="alerts" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>AI Spatial & Timeline Conflicts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myWarnings.length === 0 ? (
                      <div style={{ padding: '60px', textAlign: 'center', background: '#F0FDF4', borderRadius: '16px', border: '1px dashed #4ADE80', color: '#166534' }}>
                        <CheckCircle size={48} style={{ margin: '0 auto 16px', color: '#10B981' }} />
                        <h4 style={{ fontWeight: 800, fontSize: '1.25rem' }}>All Clear!</h4>
                        <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>AI Coordination engine reports no spatial or schedule conflicts for your active operation sites.</p>
                      </div>
                    ) : (
                      myWarnings.map(warning => (
                        <div key={warning.id} style={{ padding: '24px', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FEE2E2', display: 'flex', gap: '20px' }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0 }}>
                            <AlertTriangle size={24} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ color: '#991B1B', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>{warning.title}</h4>
                            <p style={{ fontSize: '0.95rem', color: '#7F1D1D', lineHeight: 1.6, marginBottom: '16px' }}>{warning.message}</p>
                            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #FCA5A5', fontSize: '0.85rem', color: '#7F1D1D' }}>
                              <strong>AI Recommendation:</strong> {warning.recommendation}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* SUBMIT COORDINATION RESPONSE MODAL */}
      <Modal isOpen={isResponseModalOpen} onClose={() => setIsResponseModalOpen(false)} title="Submit Coordination Response">
        <form onSubmit={handleSubmitResponse}>
          <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569' }}>
            <strong>Project:</strong> {selectedCoordProject?.name}<br />
            <strong>Location/Ward:</strong> {selectedCoordProject?.ward}<br />
            <strong>Proposed Timeline:</strong> {selectedCoordProject?.expectedTimeline}
          </div>
          
          <div className="gov-form-group">
            <label className="gov-form-label">Plan Status</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="radio" name="responseType" value="yes" checked={responseType === 'yes'} onChange={() => setResponseType('yes')} />
                ✅ Yes, we have work
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="radio" name="responseType" value="no" checked={responseType === 'no'} onChange={() => setResponseType('no')} />
                ✅ No work planned
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="radio" name="responseType" value="completed" checked={responseType === 'completed'} onChange={() => setResponseType('completed')} />
                ✅ Work already completed
              </label>
            </div>
          </div>

          {responseType === 'yes' && (
            <div style={{ marginTop: '16px' }}>
              <div className="gov-form-group">
                <label className="gov-form-label">Work Type *</label>
                <input type="text" className="gov-form-input" value={workType} onChange={e => setWorkType(e.target.value)} required placeholder="e.g., Pipeline Replacement / Cable Relaying" />
              </div>
              <div className="gov-form-row">
                <div className="gov-form-group">
                  <label className="gov-form-label">Estimated Budget required (₹ Lakhs) *</label>
                  <input type="number" className="gov-form-input" value={budget} onChange={e => setBudget(e.target.value)} required placeholder="e.g., 42" />
                </div>
                <div className="gov-form-group">
                  <label className="gov-form-label">Estimated Duration *</label>
                  <input type="text" className="gov-form-input" value={duration} onChange={e => setDuration(e.target.value)} required placeholder="e.g., 18 Days" />
                </div>
              </div>
              <div className="gov-form-row">
                <div className="gov-form-group">
                  <label className="gov-form-label">Start Date *</label>
                  <input type="date" className="gov-form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="gov-form-group">
                  <label className="gov-form-label">Completion Date *</label>
                  <input type="date" className="gov-form-input" value={completionDate} onChange={e => setCompletionDate(e.target.value)} required />
                </div>
              </div>
              <div className="gov-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input type="checkbox" id="excavation" checked={excavation} onChange={e => setExcavation(e.target.checked)} style={{ cursor: 'pointer' }} />
                <label htmlFor="excavation" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>Requires Road Excavation / Digging</label>
              </div>
              <div className="gov-form-group">
                <label className="gov-form-label">Remarks / Scope details</label>
                <textarea className="gov-form-textarea" rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Provide additional technical details..."></textarea>
              </div>
            </div>
          )}

          <button type="submit" className="premium-btn" style={{ width: '100%', padding: '12px', background: headerColor, color: 'white', marginTop: '16px' }}>
            Submit Coordination Data
          </button>
        </form>
      </Modal>

      {/* UPDATE OPERATION PROGRESS MODAL */}
      <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Update Operation Progress">
        <form onSubmit={handleUpdateProgress}>
          <div style={{ marginBottom: '20px' }}>
            <label className="gov-form-label">Work Progress (%): {tempProgress}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5" 
              value={tempProgress} 
              onChange={e => setTempProgress(parseInt(e.target.value))} 
              style={{ width: '100%', margin: '12px 0', accentColor: headerColor }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0% (Not Started)</span>
              <span>50% (Execution)</span>
              <span>100% (Completed)</span>
            </div>
          </div>
          <button type="submit" className="premium-btn" style={{ width: '100%', padding: '12px', background: '#0F172A', color: 'white' }}>
            Update Progress & Update Ledger
          </button>
        </form>
      </Modal>

      {/* SUBMIT COMPLETION VERIFICATION MODAL */}
      <Modal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} title="Submit Completion Verification">
        <form onSubmit={handleVerifySubmit}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Before marking work complete, all completion verification items must be uploaded and checked.
          </p>

          <div className="verification-checklist">
            <div 
              className={`verification-item ${verificationForm.geoPhotos ? 'checked' : ''}`}
              onClick={() => setVerificationForm(f => ({ ...f, geoPhotos: !f.geoPhotos }))}
              style={{ cursor: 'pointer' }}
            >
              <div className={`verification-check ${verificationForm.geoPhotos ? 'checked' : ''}`}>
                {verificationForm.geoPhotos ? '✓' : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={16} />
                <span>Upload Geo-tagged site photos</span>
              </div>
            </div>

            <div 
              className={`verification-item ${verificationForm.beforeAfter ? 'checked' : ''}`}
              onClick={() => setVerificationForm(f => ({ ...f, beforeAfter: !f.beforeAfter }))}
              style={{ cursor: 'pointer' }}
            >
              <div className={`verification-check ${verificationForm.beforeAfter ? 'checked' : ''}`}>
                {verificationForm.beforeAfter ? '✓' : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={16} />
                <span>Upload Before / After site images</span>
              </div>
            </div>

            <div 
              className={`verification-item ${verificationForm.certificate ? 'checked' : ''}`}
              onClick={() => setVerificationForm(f => ({ ...f, certificate: !f.certificate }))}
              style={{ cursor: 'pointer' }}
            >
              <div className={`verification-check ${verificationForm.certificate ? 'checked' : ''}`}>
                {verificationForm.certificate ? '✓' : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} />
                <span>Upload signed Completion Certificate</span>
              </div>
            </div>

            <div 
              className={`verification-item ${verificationForm.engineerApproval ? 'checked' : ''}`}
              onClick={() => setVerificationForm(f => ({ ...f, engineerApproval: !f.engineerApproval }))}
              style={{ cursor: 'pointer' }}
            >
              <div className={`verification-check ${verificationForm.engineerApproval ? 'checked' : ''}`}>
                {verificationForm.engineerApproval ? '✓' : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} />
                <span>Site Executive Engineer Approval</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '10px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #4ADE80', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> AI site photo verification check: <strong>PASSED</strong> (simulated)
          </div>

          <button 
            type="submit" 
            className="premium-btn" 
            style={{ width: '100%', padding: '12px', background: '#10B981', color: 'white', marginTop: '20px' }}
            disabled={!Object.values(verificationForm).every(Boolean)}
          >
            Submit Verification to District Administration
          </button>
        </form>
      </Modal>
    </div>
  );
}
