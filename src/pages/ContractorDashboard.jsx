import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGovContext } from '../context/GovContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Network, LayoutDashboard, Hammer, Image as ImageIcon,
  MapPin, CheckCircle, Upload, LogOut, CheckCircle2, IndianRupee, Map,
  X, AlertTriangle, FileVideo, FileImage, Sun, Moon, FileText
} from 'lucide-react';
import Modal from '../components/Modal';
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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

export default function ContractorDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('opportunities');
  const { projects, requestPayout, updateExecutionProgress, submitContractorBid } = useGovContext();
  
  // Identify user email
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) setUserEmail(session.user.email);
      else setUserEmail('demo-contractor@govsync.in');
    });
  }, []);

  const myTasks = projects.filter(p => 
    (p.contractor === userEmail || (userEmail === 'demo-contractor@govsync.in' && p.contractor === 'L&T Infra')) &&
    (p.status === 'Approved' || p.status === 'Blocked' || p.status === 'Completed' || p.status === 'Tender Awarded')
  );

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!bidProject || !bidAmount || !bidDuration) return;
    submitContractorBid(bidProject.id, userEmail, bidAmount, bidDuration, bidNotes);
    setIsBidModalOpen(false);
    setBidAmount('');
    setBidDuration('');
    setBidNotes('');
  };
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logProject, setLogProject] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logFiles, setLogFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutProject, setPayoutProject] = useState('');

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidProject, setBidProject] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDuration, setBidDuration] = useState('');
  const [bidNotes, setBidNotes] = useState('');

  // Site logs from DB
  const [siteLogs, setSiteLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchSiteLogs = useCallback(async () => {
    setLogsLoading(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setSiteLogs([
        { id: 1, created_at: new Date().toISOString(), project_id: 'PRJ-2026-001', description: 'Initial site preparation completed.', file_name: 'survey_report.pdf', file_type: 'application/pdf' },
        { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), project_id: 'PRJ-2026-001', description: 'Underground pipeline mapping alignment verified.', file_name: 'utility_overlay.png', file_type: 'image/png' }
      ]);
      setLogsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('site_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSiteLogs(data || []);
    } catch (err) {
      console.warn('Site logs table not found or query failed, loading local fallback logs:', err.message || err);
      // Retrieve logs from localStorage if they exist, or set default ones
      const localLogs = localStorage.getItem('govsync_site_logs');
      if (localLogs) {
        setSiteLogs(JSON.parse(localLogs));
      } else {
        const defaults = [
          { id: 1, created_at: new Date().toISOString(), project_id: 'PRJ-2026-001', description: 'Initial site preparation completed.', file_name: 'survey_report.pdf', file_type: 'application/pdf' },
          { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), project_id: 'PRJ-2026-001', description: 'Underground pipeline mapping alignment verified.', file_name: 'utility_overlay.png', file_type: 'image/png' }
        ];
        setSiteLogs(defaults);
        localStorage.setItem('govsync_site_logs', JSON.stringify(defaults));
      }
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteLogs();
  }, [fetchSiteLogs]);

  // File validation
  const validateFiles = (files) => {
    const errors = [];
    const validFiles = [];
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported type (${file.type || 'unknown'})`);
        continue;
      }
      validFiles.push(file);
    }
    
    if (errors.length > 0) {
      setUploadError(errors.join('; '));
    } else {
      setUploadError(null);
    }
    
    return validFiles;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = validateFiles(files);
    setLogFiles(prev => [...prev, ...valid]);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const valid = validateFiles(files);
    setLogFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setLogFiles(prev => prev.filter((_, i) => i !== index));
    setUploadError(null);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logProject || !logDesc.trim()) return;
    
    setUploading(true);
    setUploadError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isBypass = !supabaseUrl || supabaseUrl.includes('placeholder');

      if (isBypass) {
        // Local state update
        const newLogs = logFiles.length === 0 ? [{
          id: Date.now(),
          created_at: new Date().toISOString(),
          project_id: logProject,
          description: logDesc,
          file_name: 'Text log',
          file_type: 'text'
        }] : logFiles.map((file, idx) => ({
          id: Date.now() + idx,
          created_at: new Date().toISOString(),
          project_id: logProject,
          description: logDesc,
          file_url: URL.createObjectURL(file),
          file_name: file.name,
          file_type: file.type.startsWith('video') ? 'video' : 'image'
        }));
        setSiteLogs(prev => [...newLogs, ...prev]);
      } else {
        // Get current user ID (or demo fallback)
        let userId = 'demo-user';
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          userId = session.user.id;
        }

        if (logFiles.length === 0) {
          // Upload log entry without file
          const { error } = await supabase.from('site_logs').insert({
            project_id: logProject,
            contractor_id: userId === 'demo-user' ? undefined : userId,
            description: logDesc,
            file_url: '',
            file_name: 'Text log',
            file_type: 'text'
          });
          if (error) throw error;
        } else {
          // Upload each file to Storage, then insert a site_logs row
          for (const file of logFiles) {
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const storagePath = `${userId}/${logProject}/${timestamp}_${safeName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('site-logs')
              .upload(storagePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('site-logs')
              .getPublicUrl(storagePath);

            const publicUrl = urlData?.publicUrl || '';

            const { error: insertError } = await supabase.from('site_logs').insert({
              project_id: logProject,
              contractor_id: userId === 'demo-user' ? undefined : userId,
              description: logDesc,
              file_url: publicUrl,
              file_name: file.name,
              file_type: file.type.startsWith('video') ? 'video' : 'image'
            });
            if (insertError) throw insertError;
          }
        }
      }

      // Success — reset and refresh
      setIsLogModalOpen(false);
      setLogDesc('');
      setLogProject('');
      setLogFiles([]);
      fetchSiteLogs();
    } catch (err) {
      console.warn('Real Supabase upload failed, falling back to local simulation:', err.message || err);
      // Fallback to local logs
      const localLogs = localStorage.getItem('govsync_site_logs');
      const defaults = localLogs ? JSON.parse(localLogs) : [
        { id: 1, created_at: new Date().toISOString(), project_id: 'PRJ-2026-001', description: 'Initial site preparation completed.', file_name: 'survey_report.pdf', file_type: 'application/pdf' },
        { id: 2, created_at: new Date(Date.now() - 86400000).toISOString(), project_id: 'PRJ-2026-001', description: 'Underground pipeline mapping alignment verified.', file_name: 'utility_overlay.png', file_type: 'image/png' }
      ];
      const newLogs = logFiles.length === 0 ? [{
        id: Date.now(),
        created_at: new Date().toISOString(),
        project_id: logProject,
        description: logDesc,
        file_name: 'Text log',
        file_type: 'text'
      }] : logFiles.map((file, idx) => ({
        id: Date.now() + idx,
        created_at: new Date().toISOString(),
        project_id: logProject,
        description: logDesc,
        file_url: URL.createObjectURL(file),
        file_name: file.name,
        file_type: file.type.startsWith('video') ? 'video' : 'image'
      }));
      
      const updated = [...newLogs, ...defaults];
      localStorage.setItem('govsync_site_logs', JSON.stringify(updated));
      setSiteLogs(updated);
      
      setIsLogModalOpen(false);
      setLogDesc('');
      setLogProject('');
      setLogFiles([]);
    } finally {
      setUploading(false);
    }
  };

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    if (payoutProject) {
      requestPayout(payoutProject);
    }
    setIsPayoutModalOpen(false);
  };

  const executeMilestone = (project) => {
    if (project.progress < 100) {
      const newProgress = Math.min(100, project.progress + 50);
      let newMilestone = 'Finalizing Work';
      if (newProgress === 100) newMilestone = 'Completed';
      else if (newProgress === 50) newMilestone = 'Execution Phase 2';
      
      updateExecutionProgress(project.id, newProgress, newMilestone);
    }
  };

  const handleProgressChange = (project, newProgress) => {
    let newMilestone = 'Initial Site Prep';
    if (newProgress === 0) newMilestone = 'Planning';
    else if (newProgress > 0 && newProgress < 30) newMilestone = 'Excavation & Pipeline Trenching';
    else if (newProgress >= 30 && newProgress < 60) newMilestone = 'Telecom Conduit Laying';
    else if (newProgress >= 60 && newProgress < 100) newMilestone = 'Road Laying & Bitumen Prep';
    else if (newProgress === 100) newMilestone = 'Completed';
    
    updateExecutionProgress(project.id, newProgress, newMilestone);
  };

  // Helper to find project name by id
  const getProjectName = (id) => {
    const p = projects.find(pr => pr.id === id);
    return p ? p.name : id;
  };

  return (
    <div className="premium-dashboard-layout">
      {/* SIDEBAR */}
      <aside className="premium-sidebar">
        <div className="premium-sidebar-logo">
          <Network size={24} color="#10B981" />
          <h2>GovSync</h2>
        </div>
        <div style={{ padding: '0 24px', marginBottom: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Contractor Portal
        </div>
        <nav className="premium-nav">
          <button className={`premium-nav-item ${activeTab === 'opportunities' ? 'active' : ''}`} onClick={() => setActiveTab('opportunities')}>
            <MapPin size={18} /> Tender Opportunities
          </button>
          <button className={`premium-nav-item ${activeTab === 'mybids' ? 'active' : ''}`} onClick={() => setActiveTab('mybids')}>
            <FileText size={18} /> My Bids
          </button>
          <button className={`premium-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Active Projects
          </button>
          <button className={`premium-nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <ImageIcon size={18} /> Site Updates
          </button>
          <button className={`premium-nav-item ${activeTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveTab('invoice')}>
            <IndianRupee size={18} /> Submit Invoice
          </button>
          <div style={{ flex: 1 }}></div>
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
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Contractor Terminal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Execute assigned infrastructure projects.</p>
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
            <button onClick={() => setIsPayoutModalOpen(true)} className="premium-btn premium-btn-primary" style={{ background: '#10B981' }}>
              <IndianRupee size={18} /> Claim Payout
            </button>
            <button onClick={() => setIsLogModalOpen(true)} className="premium-btn" style={{ background: 'var(--primary)', color: 'white' }}>
              <Upload size={18} /> Upload Site Log
            </button>
          </div>
        </header>

        <div className="premium-content">
          <AnimatePresence mode="wait">
            
            {/* TENDER OPPORTUNITIES TAB */}
            {activeTab === 'opportunities' && (
              <motion.div key="opportunities" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Active Tenders (Bidding Open)</h3>
                  {projects.filter(p => p.aiCoordination?.status === 'funds_optimized' || p.aiCoordination?.status === 'budget_integrated' || p.aiCoordination?.status === 'tender_recommended').length === 0 && projects.filter(p => p.status === 'Tender Published' || p.status === 'Bidding Open').length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '12px' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 12px', color: '#10B981' }} />
                      <p>There are no projects currently accepting bids.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {projects
                        .filter(p => 
                          p.aiCoordination?.status === 'funds_optimized' || 
                          p.aiCoordination?.status === 'budget_integrated' || 
                          p.aiCoordination?.status === 'tender_recommended' ||
                          p.status === 'Tender Published' || 
                          p.status === 'Bidding Open'
                        )
                        .map(task => {
                          const hasBid = task.bids?.some(b => b.contractorEmail === userEmail);
                          return (
                            <motion.div key={task.id} variants={fadeUp} style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                  <span className="premium-badge" style={{ background: '#DBEAFE', color: '#1E40AF', marginBottom: '8px', display: 'inline-block' }}>Accepting Bids</span>
                                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{task.name}</h4>
                                </div>
                                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: '#6366F1' }}><FileText size={20} /></div>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '20px' }}>
                                <p style={{ marginBottom: '8px' }}><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {task.ward}</p>
                                <p>Est. Budget: <strong style={{ color: '#10B981' }}>₹{task.estimatedBudget || task.amount}L</strong></p>
                              </div>
                              {hasBid ? (
                                <button className="premium-btn" disabled style={{ background: '#F1F5F9', color: '#94A3B8', width: '100%' }}>
                                  <CheckCircle size={16} /> Bid Submitted
                                </button>
                              ) : (
                                <button onClick={() => { setBidProject(task); setIsBidModalOpen(true); }} className="premium-btn premium-btn-primary" style={{ width: '100%' }}>
                                  Submit Bid Proposal
                                </button>
                              )}
                            </motion.div>
                          );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* MY BIDS TAB */}
            {activeTab === 'mybids' && (
              <motion.div key="mybids" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>My Submitted Bids</h3>
                  {projects.filter(p => p.bids?.some(b => b.contractorEmail === userEmail)).length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '12px' }}>
                      <FileText size={32} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
                      <p>You have not submitted any bids yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {projects
                        .filter(p => p.bids?.some(b => b.contractorEmail === userEmail))
                        .map(task => {
                          const myBid = task.bids.find(b => b.contractorEmail === userEmail);
                          const isAwarded = task.aiCoordination?.status === 'tender_approved' || task.aiCoordination?.status === 'executing' || task.status === 'Approved';
                          return (
                            <motion.div key={task.id} variants={fadeUp} style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{task.name}</h4>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  <span>Bid Amount: <strong>₹{myBid.amount}L</strong></span>
                                  <span>Duration: <strong>{myBid.duration} months</strong></span>
                                  <span>Submitted: {new Date(myBid.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div>
                                {isAwarded ? (
                                  <span className="premium-badge" style={{ background: '#D1FAE5', color: '#065F46' }}>Awarded</span>
                                ) : (
                                  <span className="premium-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>Under Evaluation</span>
                                )}
                              </div>
                            </motion.div>
                          );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-kpi-grid">
                  <motion.div variants={fadeUp} className="premium-card premium-card-hover" style={{ borderLeft: '4px solid #10B981' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Assigned Nodes</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{myTasks.length}</div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="premium-card premium-card-hover" style={{ borderLeft: '4px solid #EF4444' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Blocked / Coordination</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{myTasks.filter(t => t.status === 'Blocked' || t.status === 'Pending Coordination').length}</div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="premium-card premium-card-hover" style={{ borderLeft: '4px solid #6366F1' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>Site Logs Filed</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{siteLogs.length}</div>
                  </motion.div>
                </div>

                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Assigned Infrastructure Projects</h3>
                  {myTasks.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '12px' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 12px', color: '#10B981' }} />
                      <p>You have no active projects. Wait for the district administration to assign you a node.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <AnimatePresence>
                        {myTasks.map(task => (
                          <motion.div key={task.id} variants={fadeUp} style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: '#10B981' }}><MapPin size={24} /></div>
                                <div>
                                  <h4 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{task.name}</h4>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Allocated Budget: <strong style={{ color: '#10B981' }}>₹{task.amount} Cr</strong></p>
                                </div>
                              </div>
                              <span className="premium-badge" style={task.status === 'Blocked' ? { background: '#FEE2E2', color: '#991B1B' } : { background: '#D1FAE5', color: '#065F46' }}>
                                {task.status}
                              </span>
                            </div>
                                                 <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                                <span>Execution Progress: {task.progress || 0}%</span>
                                <span>Current Phase: {task.milestone || 'Not Started'}</span>
                              </div>
                              <div style={{ width: '100%', background: '#F1F5F9', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${task.progress || 0}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} style={{ height: '100%', background: '#10B981' }} />
                              </div>

                              {/* Progress Controls */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <button 
                                  onClick={() => handleProgressChange(task, Math.max(0, (task.progress || 0) - 10))}
                                  disabled={(task.progress || 0) === 0}
                                  className="premium-btn" 
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#EF4444', color: 'white', minWidth: '40px' }}
                                >
                                  -10%
                                </button>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  step="10" 
                                  value={task.progress || 0} 
                                  onChange={(e) => handleProgressChange(task, parseInt(e.target.value))}
                                  style={{ flex: 1, accentColor: '#6366F1', cursor: 'pointer' }}
                                />
                                <button 
                                  onClick={() => handleProgressChange(task, Math.min(100, (task.progress || 0) + 10))}
                                  disabled={(task.progress || 0) === 100}
                                  className="premium-btn" 
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#10B981', color: 'white', minWidth: '40px' }}
                                >
                                  +10%
                                </button>
                              </div>

                              {task.responses && task.responses.length > 0 && (
                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Sequenced Master Plan Dependencies</h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {task.responses.map((resp, idx) => (
                                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>✓</div>
                                        <span><strong>{resp.dept}</strong> ({resp.timeline})</span>
                                      </div>
                                    ))}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                                      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #CBD5E1', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</div>
                                      <span><strong>Your Operations</strong></span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {task.payoutRequested ? (
                                <span style={{ color: '#F59E0B', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#FFFBEB', borderRadius: '8px' }}>
                                  <div className="login-spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(245, 158, 11, 0.2)', borderTopColor: '#F59E0B' }}></div>
                                  Invoice Pending Finance Release
                                </span>
                              ) : (
                                <button onClick={() => { setPayoutProject(task.id); setIsPayoutModalOpen(true); }} className="premium-btn premium-btn-primary" style={{ background: '#10B981' }}>
                                  Generate & Submit Invoice
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div key="logs" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={20} color="#10B981" /> Site Updates Feed
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {/* Real site logs from database */}
                    {siteLogs.map(log => (
                      <motion.div key={log.id} variants={fadeUp} style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                        {log.file_url && log.file_type === 'video' ? (
                          <video 
                            src={log.file_url} 
                            controls 
                            style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px', background: 'var(--primary)' }}
                          />
                        ) : log.file_url ? (
                          <img 
                            src={log.file_url} 
                            alt={log.description} 
                            style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '160px', background: 'linear-gradient(45deg, #CBD5E1, #94A3B8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '16px' }}>
                            <Map size={32} />
                          </div>
                        )}
                        <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}>{log.description}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{getProjectName(log.project_id)}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
                            <CheckCircle2 size={14} color="#10B981" /> Uploaded to GovSync
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    ))}

                    {/* Upload new log card */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #CBD5E1', borderRadius: '16px', color: '#94A3B8', padding: '40px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setIsLogModalOpen(true)}>
                      <div style={{ textAlign: 'center' }}>
                        <Upload size={32} style={{ margin: '0 auto 12px' }} />
                        <h4 style={{ fontWeight: 700, color: '#475569' }}>Upload New Log</h4>
                        <p style={{ fontSize: '0.8rem' }}>Geo-tagged photos required</p>
                      </div>
                    </div>

                    {/* Empty state */}
                    {siteLogs.length === 0 && !logsLoading && (
                      <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                        <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No site logs uploaded yet</p>
                        <p style={{ fontSize: '0.85rem' }}>Click "Upload New Log" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* INVOICE TAB */}
            {activeTab === 'invoice' && (
              <motion.div key="invoice" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Submit Billing Invoice</h3>
                  <div style={{ padding: '32px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handlePayoutSubmit}>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Select Project</label>
                        <select value={payoutProject} onChange={e => setPayoutProject(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }}>
                          <option value="">-- Choose Project --</option>
                          {myTasks.map(t => (
                            <option key={t.id} value={t.id}>{t.name} (₹{t.amount}Cr)</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%', padding: '14px', background: '#10B981' }}>
                        Generate Invoice & Route to Finance
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* SUBMIT BID MODAL */}
      <Modal isOpen={isBidModalOpen} onClose={() => { setIsBidModalOpen(false); setBidProject(null); }} title="Submit Bid Proposal">
        {bidProject && (
          <form onSubmit={handleBidSubmit}>
            <div style={{ marginBottom: '24px', background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{bidProject.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Budget: ₹{bidProject.estimatedBudget || bidProject.amount}L</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Bid Amount (₹ Lakhs)</label>
              <input type="number" step="0.01" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required placeholder={`e.g. ${bidProject.estimatedBudget || bidProject.amount}`} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Estimated Duration (Months)</label>
              <input type="number" value={bidDuration} onChange={e => setBidDuration(e.target.value)} required placeholder="e.g. 6" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Technical Proposal / Notes</label>
              <textarea value={bidNotes} onChange={e => setBidNotes(e.target.value)} rows="4" placeholder="Detail your approach, materials, and timeline milestones..." style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }}></textarea>
            </div>

            <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%', padding: '14px', background: '#6366F1' }}>
              Submit Secure Bid
            </button>
          </form>
        )}
      </Modal>

      {/* UPLOAD SITE LOG MODAL */}
      <Modal isOpen={isLogModalOpen} onClose={() => { setIsLogModalOpen(false); setLogFiles([]); setUploadError(null); }} title="Upload Site Log">
        <form onSubmit={handleLogSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Select Project Node</label>
            <select value={logProject} onChange={e => setLogProject(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }}>
              <option value="">-- Select Project --</option>
              {myTasks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Log Description</label>
            <textarea value={logDesc} onChange={e => setLogDesc(e.target.value)} rows="3" required placeholder="Describe today's progress..." style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }}></textarea>
          </div>

          {/* File Drop Zone — wired to real input */}
          <div 
            style={{ marginBottom: '16px', padding: '24px', border: '2px dashed #CBD5E1', borderRadius: '12px', textAlign: 'center', color: '#94A3B8', cursor: 'pointer', transition: 'all 0.2s', background: logFiles.length > 0 ? '#F0FDF4' : 'transparent' }}
            onClick={handleDropZoneClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,video/*" 
              multiple 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <ImageIcon size={24} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {logFiles.length > 0 ? `${logFiles.length} file(s) selected` : 'Click to browse geo-tagged media'}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>PNG, JPG, MP4 up to 50MB</div>
          </div>

          {/* Selected files list */}
          {logFiles.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logFiles.map((file, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    {file.type.startsWith('video') ? <FileVideo size={16} color="#6366F1" /> : <FileImage size={16} color="#10B981" />}
                    <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                  </div>
                  <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error message */}
          {uploadError && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#991B1B' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              {uploadError}
            </div>
          )}

          <button 
            type="submit" 
            className="premium-btn premium-btn-primary" 
            style={{ width: '100%', opacity: uploading ? 0.7 : 1 }}
            disabled={uploading}
          >
            {uploading ? (
              <><div className="login-spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div> Uploading...</>
            ) : (
              'Upload securely to GovSync'
            )}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isPayoutModalOpen} onClose={() => setIsPayoutModalOpen(false)} title="Claim Milestone Payout">
        <form onSubmit={handlePayoutSubmit}>
          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Are you sure you want to route a payout claim to the Finance Department? This will trigger an AI site inspection.</div>
          </div>
          <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%', background: '#10B981' }}>
            Confirm Payout Request
          </button>
        </form>
      </Modal>
    </div>
  );
}
