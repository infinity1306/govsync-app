import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGovContext } from '../context/GovContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Network, LayoutDashboard, Coins, FileText, Bell, 
  CheckCircle, Clock, ShieldCheck, ArrowUpRight, CheckCircle2,
  AlertCircle, LogOut, Wallet, Download, Sun, Moon
} from 'lucide-react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabaseClient';
import NotificationsDropdown from '../components/NotificationsDropdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function FinanceDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const { escrowFunds, projects, authorizeRelease, injectCapital, sanctionBudget } = useGovContext();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50');

  const pendingPayouts = projects.filter(p => p.payoutRequested);
  const pendingSanctions = projects.filter(p => p.awardedBid && !p.budgetSanctioned);
  const completedProjects = projects.filter(p => p.status === 'Completed');
  const activeCount = projects.filter(p => p.status !== 'Completed').length;

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    injectCapital(depositAmount);
    setIsDepositModalOpen(false);
    setDepositAmount('');
  };

  // --- PDF REPORT GENERATION ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN');

    // Header bar
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('GovSync', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Infrastructure Savings & Coordination Report', 14, 30);
    doc.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth - 14, 20, { align: 'right' });
    doc.text('Bhopal Municipal Corporation', pageWidth - 14, 30, { align: 'right' });

    // Subtitle line
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 40, pageWidth, 2, 'F');

    // Summary Section
    let y = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Escrow Fund Summary', 14, y);
    y += 10;

    const totalBudget = projects.reduce((sum, p) => sum + (p.amount || 0), 0);
    const savedAmount = Math.round(totalBudget * 0.12);

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Total Escrow Vault', `Rs. ${escrowFunds.total} Cr`],
        ['Released to Contractors', `Rs. ${escrowFunds.released} Cr`],
        ['Pending Verification', `Rs. ${escrowFunds.pendingVerification} Cr`],
        ['Total Active Projects', `${activeCount}`],
        ['Completed Projects', `${completedProjects.length}`],
        ['Est. Taxpayer Savings (via conflict resolution)', `Rs. ${savedAmount} Cr`],
      ],
      headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 10, cellPadding: 5 },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 15;

    // Project Details Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project-wise Breakdown', 14, y);
    y += 10;

    const projectRows = projects.map(p => [
      p.id,
      p.name,
      p.dept,
      p.contractor || 'Unassigned',
      p.status,
      `Rs. ${p.amount} Cr`,
      `${p.progress || 0}%`
    ]);

    autoTable(doc, {
      startY: y,
      head: [['ID', 'Project Name', 'Department', 'Contractor', 'Status', 'Budget', 'Progress']],
      body: projectRows,
      headStyles: { fillColor: [30, 41, 59], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 15;

    // Savings highlight box
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageWidth - 28, 30, 4, 4, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estimated Annual Savings through GovSync Coordination: Rs. ${savedAmount} Cr`, pageWidth / 2, y + 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('By eliminating duplicate excavations and sequencing multi-department work, GovSync prevents re-digging costs.', pageWidth / 2, y + 22, { align: 'center' });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`GovSync Official Report | Page ${i} of ${pageCount} | Confidential`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`GovSync_Savings_Report_${now.toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="premium-dashboard-layout">
      {/* SIDEBAR */}
      <aside className="premium-sidebar">
        <div className="premium-sidebar-logo">
          <Network size={24} color="#FBBF24" />
          <h2>GovSync</h2>
        </div>
        <div style={{ padding: '0 24px', marginBottom: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Finance Portal
        </div>
        <nav className="premium-nav">
          <button className={`premium-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Escrow Overview
          </button>
          <button className={`premium-nav-item ${activeTab === 'sanctions' ? 'active' : ''}`} onClick={() => setActiveTab('sanctions')}>
            <CheckCircle size={18} /> Budget Sanctions
            {pendingSanctions.length > 0 && <span style={{ background: '#6366F1', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: 'auto' }}>{pendingSanctions.length}</span>}
          </button>
          <button className={`premium-nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
            <CheckCircle2 size={18} /> Milestone Approvals
            {pendingPayouts.length > 0 && <span style={{ background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: 'auto' }}>{pendingPayouts.length}</span>}
          </button>
          <button className={`premium-nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <FileText size={18} /> Audit Trail
          </button>
          <button onClick={generatePDF} className="premium-nav-item" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.08))', border: '1px solid rgba(16,185,129,0.15)', color: '#10B981', marginTop: '8px' }}>
            <Download size={18} /> Download PDF Report
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
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>State Finance Department</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Secure Escrow Allocation & Disbursement</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              FD
            </div>
          </div>
        </header>

        <div className="premium-content">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                {/* Vault Card */}
                <motion.div variants={fadeUp} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', borderRadius: '24px', padding: '40px', color: 'white', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} color="#10B981" /> Central Escrow Vault
                    </h2>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                      ₹{escrowFunds.total} <span style={{ fontSize: '1.5rem', color: '#94A3B8' }}>Cr</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Released to Contractors</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10B981' }}>₹{escrowFunds.released} Cr</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Pending Approvals</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F59E0B' }}>₹{escrowFunds.pendingVerification} Cr</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button onClick={() => setIsDepositModalOpen(true)} className="premium-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Coins size={18} /> Deposit to Escrow
                    </button>
                  </div>
                </motion.div>

                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>Contractor Payout Requests</h3>
                  {pendingPayouts.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '12px' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 12px', color: '#10B981' }} />
                      <p>All payout requests have been resolved.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '16px', textAlign: 'left' }}>Project</th>
                          <th style={{ padding: '16px', textAlign: 'left' }}>Contractor</th>
                          <th style={{ padding: '16px', textAlign: 'left' }}>Milestone</th>
                          <th style={{ padding: '16px', textAlign: 'right' }}>Amount</th>
                          <th style={{ padding: '16px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {pendingPayouts.map(p => (
                            <motion.tr key={p.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</td>
                              <td style={{ padding: '16px', color: '#475569' }}>{p.contractor}</td>
                              <td style={{ padding: '16px', color: '#475569' }}>{p.milestone}</td>
                              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: '#10B981' }}>₹{p.amount} Cr</td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <button onClick={() => authorizeRelease(p.id)} className="premium-btn premium-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#10B981' }}>
                                  Authorize Release
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            )}

            {/* SANCTIONS TAB */}
            {activeTab === 'sanctions' && (
              <motion.div key="sanctions" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Project Budget Sanctions</h2>
                {pendingSanctions.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', background: '#EEF2FF', borderRadius: '16px', border: '1px dashed #818CF8', color: '#3730A3' }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 16px', color: '#6366F1' }} />
                    <h4 style={{ fontWeight: 800, fontSize: '1.25rem' }}>No Pending Sanctions</h4>
                    <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>All awarded projects have had their budgets sanctioned.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <AnimatePresence>
                      {pendingSanctions.map(p => (
                        <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</h3>
                              <span style={{ background: '#EEF2FF', color: '#4338CA', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>Awaiting Sanction</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              Awarded to: <strong>{p.awardedBid?.contractorEmail}</strong>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Budget Req.</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366F1' }}>₹{p.amount} L</div>
                            </div>
                            <button onClick={() => sanctionBudget(p.id)} className="premium-btn premium-btn-primary" style={{ padding: '12px 24px', background: '#6366F1' }}>
                              <CheckCircle size={18} /> Sanction Budget
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* PENDING APPROVALS TAB */}
            {activeTab === 'approvals' && (
              <motion.div key="approvals" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>Disbursement Approvals</h2>
                {pendingPayouts.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', background: '#F0FDF4', borderRadius: '16px', border: '1px dashed #4ADE80', color: '#166534' }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 16px', color: '#10B981' }} />
                    <h4 style={{ fontWeight: 800, fontSize: '1.25rem' }}>No Pending Invoices</h4>
                    <p style={{ marginTop: '8px', fontSize: '0.95rem' }}>All contractor milestone invoices have been cleared.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <AnimatePresence>
                      {pendingPayouts.map(p => (
                        <motion.div key={p.id} variants={fadeUp} style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={14} /> Action Required
                              </div>
                              <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{p.name}</h4>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.contractor} · {p.dept} · {p.milestone}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>₹{p.amount} Cr</div>
                              <button onClick={() => authorizeRelease(p.id)} className="premium-btn" style={{ background: '#10B981', color: 'white' }}>
                                Disburse Funds from Escrow
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* AUDIT TRAIL TAB */}
            {activeTab === 'audit' && (
              <motion.div key="audit" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="premium-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={24} color="#6366F1" /> Immutable Escrow Ledger
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {completedProjects.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No transactions recorded yet.</p>
                    ) : (
                      completedProjects.map(p => (
                        <motion.div key={p.id} variants={fadeUp} style={{ padding: '20px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ArrowUpRight size={20} />
                            </div>
                            <div>
                              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '2px' }}>{p.name}</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Disbursed to: <strong>{p.contractor}</strong>
                              </p>
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace', marginTop: '6px' }}>
                                TX: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#10B981', fontSize: '1.2rem' }}>₹{p.amount} Cr</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                              <CheckCircle2 size={12} color="#10B981" /> Verified
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title="Inject Capital into Escrow">
        <form onSubmit={handleDepositSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Amount (₹ Cr)</label>
            <input type="number" step="1" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required 
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none' }} />
          </div>
          <button type="submit" className="premium-btn premium-btn-primary" style={{ width: '100%', padding: '14px', background: '#F59E0B' }}>
            <Wallet size={18} /> Confirm Deposit
          </button>
        </form>
      </Modal>
    </div>
  );
}
