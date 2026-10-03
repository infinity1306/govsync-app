import React, { useState, useMemo, useEffect } from 'react';
import { useGovContext } from '../context/GovContext';
import { DEPARTMENTS, getDeptById, COORDINATION_STAGES } from '../context/GovContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Clock,
  Brain, Shield, TrendingUp, BarChart3, FileText, MapPin, Users, Zap,
  ArrowRight, Eye, ThumbsUp, ThumbsDown, RotateCcw, MessageSquare,
  Layers, Target, DollarSign, Gauge, Activity, Info, ChevronUp,
  Check, X, Send, AlertCircle, ListChecks, TrendingDown, Award, Hammer
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════
   STYLES — Professional government enterprise aesthetic
   ═══════════════════════════════════════════════════════════════════ */
const S = {
  page: { display: 'flex', flexDirection: 'column', gap: '20px', padding: '0' },
  glass: {
    background: 'var(--card-bg, rgba(255,255,255,0.72))',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border, rgba(0,0,0,0.08))',
    borderRadius: '16px',
    padding: '24px',
  },
  glassSmall: {
    background: 'var(--card-bg, rgba(255,255,255,0.72))',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--border, rgba(0,0,0,0.08))',
    borderRadius: '12px',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)',
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
  },
  label: { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '4px' },
  value: { fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' },
  badge: (bg, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
    background: bg, color: color, whiteSpace: 'nowrap',
  }),
  btn: (bg, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
    background: bg, color: color, border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  }),
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' },
  divider: { borderTop: '1px solid var(--border)', margin: '16px 0' },
  input: {
    width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)',
    outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
    border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)',
    outline: 'none', cursor: 'pointer',
  },
};

/* ═══════════════════════════════════════════════════════════════════
   CONFIDENCE RING — radial progress gauge
   ═══════════════════════════════════════════════════════════════════ */
const ConfidenceRing = ({ value, size = 54, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 85 ? '#10B981' : value >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: size * 0.28, fontWeight: 700, fill: color, transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {value}%
      </text>
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   RISK METER — horizontal bar
   ═══════════════════════════════════════════════════════════════════ */
const RiskMeter = ({ score }) => {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? '#EF4444' : score >= 4 ? '#F59E0B' : '#10B981';
  const label = score >= 7 ? 'High Risk' : score >= 4 ? 'Medium Risk' : 'Low Risk';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Risk Score</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color }}>{score}/10 — {label}</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   WORKFLOW TIMELINE — horizontal stepper with animated pulse
   ═══════════════════════════════════════════════════════════════════ */
const WorkflowTimeline = ({ coordination }) => {
  const completedStages = (coordination?.workflowTimeline || []).map(w => w.stage);
  const currentIdx = Math.max(0, COORDINATION_STAGES.findIndex(s => s.id === coordination?.status));

  return (
    <div style={{ ...S.glass, padding: '20px 28px' }}>
      <div style={S.sectionTitle}>
        <Activity size={18} color="#6366F1" /> Coordination Workflow
        <span style={S.badge('#EEF2FF', '#4338CA')}>
          Stage {currentIdx + 1} of {COORDINATION_STAGES.length}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', gap: '0', paddingBottom: '8px' }}>
        {COORDINATION_STAGES.map((stage, i) => {
          const isDone = completedStages.includes(stage.id);
          const isCurrent = i === currentIdx;
          const timeEntry = (coordination?.workflowTimeline || []).find(w => w.stage === stage.id);
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-start', flex: '1', minWidth: '80px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ position: 'relative' }}>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', inset: '-6px', borderRadius: '50%',
                      background: 'rgba(99,102,241,0.15)',
                      animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                    }} />
                  )}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', position: 'relative', zIndex: 1,
                    background: isDone ? '#10B981' : isCurrent ? '#6366F1' : 'var(--border)',
                    color: isDone || isCurrent ? '#fff' : 'var(--text-muted)',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(99,102,241,0.2)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {isDone ? '✓' : stage.icon}
                  </div>
                </div>
                <span style={{
                  fontSize: '9px', fontWeight: isCurrent ? 700 : 500,
                  color: isDone ? '#10B981' : isCurrent ? '#6366F1' : 'var(--text-muted)',
                  textAlign: 'center', marginTop: '6px', lineHeight: 1.2, maxWidth: '72px',
                }}>
                  {stage.label}
                </span>
                {timeEntry && (
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(timeEntry.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
              {i < COORDINATION_STAGES.length - 1 && (
                <div style={{
                  height: '2px', flex: '1', minWidth: '8px', marginTop: '15px',
                  background: isDone ? '#10B981' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PROJECT METADATA CARD
   ═══════════════════════════════════════════════════════════════════ */
const ProjectMeta = ({ project }) => (
  <div style={{ ...S.glass }}>
    <div style={S.sectionTitle}><FileText size={18} color="#6366F1" /> Project Information</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
      {[
        { label: 'Project ID', value: project.id, icon: <FileText size={14} color="#6366F1" /> },
        { label: 'Project Name', value: project.name, icon: <Layers size={14} color="#0891B2" /> },
        { label: 'Type', value: project.complaintType, icon: <Target size={14} color="#EA580C" /> },
        { label: 'Ward / Location', value: project.ward, icon: <MapPin size={14} color="#DC2626" /> },
        { label: 'Budget (Est.)', value: `₹${project.estimatedBudget}L`, icon: <DollarSign size={14} color="#16A34A" /> },
        { label: 'Priority', value: project.priority, icon: <AlertTriangle size={14} color={project.priority === 'Critical' ? '#EF4444' : '#F59E0B'} /> },
        { label: 'Timeline', value: project.expectedTimeline, icon: <Clock size={14} color="#7C3AED" /> },
        { label: 'GPS', value: `${project.gpsLocation?.lat?.toFixed(4)}, ${project.gpsLocation?.lng?.toFixed(4)}`, icon: <MapPin size={14} color="#0284C7" /> },
        { label: 'Initiated By', value: project.raisedBy || 'Admin', icon: <Users size={14} color="#A855F7" /> },
      ].map((item, i) => (
        <div key={i}>
          <div style={S.label}>{item.icon} {item.label}</div>
          <div style={{ ...S.value, fontSize: '13px' }}>{item.value}</div>
        </div>
      ))}
    </div>
    {project.description && (
      <div style={{ marginTop: '16px', padding: '12px', background: 'var(--hover-bg)', borderRadius: '10px' }}>
        <div style={S.label}>Project Description</div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{project.description}</div>
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   DEPARTMENT RESPONSE FORM — for live response submission
   ═══════════════════════════════════════════════════════════════════ */
const DeptResponseForm = ({ deptId, onSubmit, onCancel }) => {
  const dept = getDeptById(deptId);
  const [form, setForm] = useState({
    currentWork: '', futureWork: '', futureWorkYears: '1',
    noReason: '', noExplanation: '',
    details: {
      projectName: '', estimatedCost: '', estimatedDuration: '', priority: 'Medium',
      utilityType: '', requiredExcavation: false, expectedStart: '', expectedCompletion: '',
      reason: '', supportingDocs: [], gisLayer: '',
    },
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setD = (k, v) => setForm(f => ({ ...f, details: { ...f.details, [k]: v } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.currentWork) return;
    const payload = {
      currentWork: form.currentWork,
      futureWork: form.futureWork || 'no',
      futureWorkYears: parseInt(form.futureWorkYears) || 1,
      noReason: form.currentWork === 'no' ? form.noReason : undefined,
      noExplanation: form.currentWork === 'no' && form.noReason === 'other' ? form.noExplanation : undefined,
    };
    if ((form.currentWork === 'yes' || form.futureWork === 'yes') && form.details.projectName) {
      payload.details = {
        ...form.details,
        estimatedCost: parseFloat(form.details.estimatedCost) || 0,
        supportingDocs: form.details.supportingDocs || [],
      };
    }
    onSubmit(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      style={{ ...S.glass, border: `2px solid ${dept?.color}30` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>{dept?.icon}</span>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{dept?.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Department Coordination Questionnaire</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Q1 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Q1. Do you currently have any work planned inside this project area?
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['yes', 'no'].map(v => (
              <button key={v} type="button"
                onClick={() => set('currentWork', v)}
                style={{
                  ...S.btn(
                    form.currentWork === v ? (v === 'yes' ? '#DCFCE7' : '#FEE2E2') : 'var(--hover-bg)',
                    form.currentWork === v ? (v === 'yes' ? '#166534' : '#991B1B') : 'var(--text-muted)'
                  ),
                  border: `1px solid ${form.currentWork === v ? (v === 'yes' ? '#BBF7D0' : '#FECACA') : 'var(--border)'}`,
                  padding: '10px 24px', fontSize: '14px', fontWeight: 700,
                }}
              >
                {v === 'yes' ? '✅ YES' : '✗ NO'}
              </button>
            ))}
          </div>
        </div>

        {/* If NO — reason */}
        {form.currentWork === 'no' && (
          <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--hover-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>Why?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { v: 'work_completed', label: '✅ Work already completed' },
                { v: 'no_infrastructure_required', label: '🚫 No infrastructure required' },
                { v: 'future_not_expected', label: '📅 Future work not expected' },
                { v: 'other', label: '💬 Other' },
              ].map(opt => (
                <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input type="radio" name="noReason" value={opt.v} checked={form.noReason === opt.v}
                    onChange={e => set('noReason', e.target.value)} style={{ accentColor: '#6366F1' }} />
                  {opt.label}
                </label>
              ))}
              {form.noReason === 'other' && (
                <textarea
                  value={form.noExplanation}
                  onChange={e => set('noExplanation', e.target.value)}
                  placeholder="Please explain..."
                  style={{ ...S.input, minHeight: '80px', marginTop: '8px', resize: 'vertical' }}
                />
              )}
            </div>
          </div>
        )}

        {/* Q2 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Q2. Will your department require any work in this area within the next 1–5 years?
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: form.futureWork === 'yes' ? '12px' : 0 }}>
            {['yes', 'no'].map(v => (
              <button key={v} type="button"
                onClick={() => set('futureWork', v)}
                style={{
                  ...S.btn(
                    form.futureWork === v ? (v === 'yes' ? '#DBEAFE' : '#F1F5F9') : 'var(--hover-bg)',
                    form.futureWork === v ? (v === 'yes' ? '#1E40AF' : '#64748B') : 'var(--text-muted)'
                  ),
                  border: `1px solid ${form.futureWork === v ? (v === 'yes' ? '#BFDBFE' : '#CBD5E1') : 'var(--border)'}`,
                  padding: '10px 24px', fontSize: '14px', fontWeight: 700,
                }}
              >
                {v === 'yes' ? '📅 YES' : '✗ NO'}
              </button>
            ))}
            {form.futureWork === 'yes' && (
              <select value={form.futureWorkYears} onChange={e => set('futureWorkYears', e.target.value)}
                style={{ ...S.select, width: 'auto', minWidth: '120px' }}>
                {[1, 2, 3, 5].map(y => <option key={y} value={y}>Within {y} year{y > 1 ? 's' : ''}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Work Details — shown if current=yes or future=yes */}
        {(form.currentWork === 'yes' || form.futureWork === 'yes') && (
          <div style={{ padding: '16px', background: 'var(--hover-bg)', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Work Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={S.label}>Project Name *</div>
                <input style={S.input} value={form.details.projectName}
                  onChange={e => setD('projectName', e.target.value)} placeholder="e.g., Pipeline Replacement" required />
              </div>
              <div>
                <div style={S.label}>Estimated Cost (₹ Lakhs) *</div>
                <input type="number" style={S.input} value={form.details.estimatedCost}
                  onChange={e => setD('estimatedCost', e.target.value)} placeholder="e.g., 45" />
              </div>
              <div>
                <div style={S.label}>Duration</div>
                <input style={S.input} value={form.details.estimatedDuration}
                  onChange={e => setD('estimatedDuration', e.target.value)} placeholder="e.g., 15 Days" />
              </div>
              <div>
                <div style={S.label}>Priority</div>
                <select style={S.select} value={form.details.priority}
                  onChange={e => setD('priority', e.target.value)}>
                  {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <div style={S.label}>Utility Type</div>
                <input style={S.input} value={form.details.utilityType}
                  onChange={e => setD('utilityType', e.target.value)} placeholder="e.g., Water Main (300mm)" />
              </div>
              <div>
                <div style={S.label}>Requires Excavation</div>
                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  {[{ v: true, l: '⛏️ Yes' }, { v: false, l: 'No' }].map(opt => (
                    <button key={String(opt.v)} type="button"
                      onClick={() => setD('requiredExcavation', opt.v)}
                      style={{
                        ...S.btn(form.details.requiredExcavation === opt.v ? '#FEF3C7' : 'var(--hover-bg)',
                          form.details.requiredExcavation === opt.v ? '#92400E' : 'var(--text-muted)'),
                        border: '1px solid var(--border)',
                      }}>{opt.l}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={S.label}>Expected Start Date</div>
                <input type="date" style={S.input} value={form.details.expectedStart}
                  onChange={e => setD('expectedStart', e.target.value)} />
              </div>
              <div>
                <div style={S.label}>Expected Completion</div>
                <input type="date" style={S.input} value={form.details.expectedCompletion}
                  onChange={e => setD('expectedCompletion', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <div style={S.label}>Reason / Justification</div>
                <textarea style={{ ...S.input, minHeight: '72px', resize: 'vertical' }}
                  value={form.details.reason} onChange={e => setD('reason', e.target.value)}
                  placeholder="Why is this work needed?" />
              </div>
              <div>
                <div style={S.label}>GIS Layer Reference</div>
                <input style={S.input} value={form.details.gisLayer}
                  onChange={e => setD('gisLayer', e.target.value)} placeholder="e.g., Water_Network_v3" />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ ...S.btn('#6366F1', '#fff'), padding: '10px 28px', fontSize: '13px' }}>
            <Send size={14} /> Submit Response
          </button>
          <button type="button" onClick={onCancel}
            style={{ ...S.btn('var(--hover-bg)', 'var(--text-muted)'), padding: '10px 20px' }}>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   DEPARTMENT RESPONSE CARD
   ═══════════════════════════════════════════════════════════════════ */
const DeptResponseCard = ({ deptId, response, onSimulate, projectId }) => {
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { submitDeptCoordinationResponse } = useGovContext();
  const dept = getDeptById(deptId);
  if (!dept) return null;

  const hasResponded = !!response?.respondedAt;
  const currentWork = response?.currentWork;
  const futureWork = response?.futureWork;

  const NO_REASONS = {
    work_completed: 'Work Already Completed',
    no_infrastructure_required: 'No Infrastructure Required',
    future_not_expected: 'Future Work Not Expected',
    other: 'Other',
  };

  const handleSubmitResponse = (payload) => {
    submitDeptCoordinationResponse(projectId, deptId, payload);
    setShowForm(false);
  };

  return (
    <AnimatePresence mode="wait">
      {showForm ? (
        <DeptResponseForm key="form" deptId={deptId} onSubmit={handleSubmitResponse} onCancel={() => setShowForm(false)} />
      ) : (
        <motion.div
          key="card"
          layout
          style={{
            ...S.glassSmall,
            borderLeft: `3px solid ${dept.color}`,
            cursor: hasResponded ? 'pointer' : 'default',
          }}
          whileHover={hasResponded ? { y: -2, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' } : {}}
          onClick={() => hasResponded && setExpanded(!expanded)}
        >
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{dept.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {hasResponded
                    ? `Responded ${new Date(response.respondedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                    : 'Awaiting Response'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {!hasResponded && <span style={S.badge('#FEF3C7', '#92400E')}>⏳ Pending</span>}
              {hasResponded && currentWork === 'yes' && <span style={S.badge('#DCFCE7', '#166534')}>✅ Current Work</span>}
              {hasResponded && currentWork === 'no' && <span style={S.badge('#FEE2E2', '#991B1B')}>✗ No Current</span>}
              {hasResponded && futureWork === 'yes' && <span style={S.badge('#DBEAFE', '#1E40AF')}>📅 Future</span>}
              {hasResponded && expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : hasResponded ? <ChevronDown size={16} color="var(--text-muted)" /> : null}
              {!hasResponded && (
                <button
                  onClick={e => { e.stopPropagation(); setShowForm(true); }}
                  style={{ ...S.btn('#6366F1', '#fff'), fontSize: '11px', padding: '4px 10px' }}
                >
                  <Send size={11} /> Submit
                </button>
              )}
            </div>
          </div>

          {/* EXPANDED DETAILS */}
          <AnimatePresence>
            {expanded && hasResponded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={S.divider} />
                {/* Q1 & Q2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ ...S.glassSmall, padding: '10px 12px', background: 'var(--hover-bg)' }}>
                    <div style={S.label}>Q1: Current work in this area?</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: currentWork === 'yes' ? '#16A34A' : '#DC2626' }}>
                      {currentWork === 'yes' ? '✅ YES' : '✗ NO'}
                    </div>
                  </div>
                  <div style={{ ...S.glassSmall, padding: '10px 12px', background: 'var(--hover-bg)' }}>
                    <div style={S.label}>Q2: Future work (1-5 years)?</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: futureWork === 'yes' ? '#16A34A' : '#DC2626' }}>
                      {futureWork === 'yes' ? `✅ YES (${response.futureWorkYears || '–'}yr)` : '✗ NO'}
                    </div>
                  </div>
                </div>

                {/* NO REASON */}
                {currentWork === 'no' && response.noReason && (
                  <div style={{ ...S.glassSmall, padding: '10px 12px', background: 'var(--hover-bg)', marginBottom: '12px' }}>
                    <div style={S.label}>Reason for "No"</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {NO_REASONS[response.noReason] || response.noReason}
                    </div>
                    {response.noExplanation && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{response.noExplanation}</div>
                    )}
                  </div>
                )}

                {/* WORK DETAILS */}
                {response.details && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {[
                      { label: 'Project Name', value: response.details.projectName },
                      { label: 'Est. Cost', value: `₹${response.details.estimatedCost}L` },
                      { label: 'Duration', value: response.details.estimatedDuration },
                      { label: 'Priority', value: response.details.priority },
                      { label: 'Utility Type', value: response.details.utilityType },
                      { label: 'Excavation', value: response.details.requiredExcavation ? '⛏️ Yes' : 'No' },
                      { label: 'Start Date', value: response.details.expectedStart },
                      { label: 'Completion', value: response.details.expectedCompletion },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '6px 8px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                        <div style={{ ...S.label, fontSize: '9px' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value || '–'}</div>
                      </div>
                    ))}
                    {response.details.reason && (
                      <div style={{ gridColumn: '1 / -1', padding: '8px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                        <div style={{ ...S.label, fontSize: '9px' }}>Reason</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{response.details.reason}</div>
                      </div>
                    )}
                    {response.details.supportingDocs?.length > 0 && (
                      <div style={{ gridColumn: '1 / -1', padding: '8px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                        <div style={{ ...S.label, fontSize: '9px' }}>Supporting Documents</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {response.details.supportingDocs.map((doc, i) => (
                            <span key={i} style={S.badge('var(--card-bg)', 'var(--text-primary)')}>
                              <FileText size={10} /> {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {response.details.gisLayer && (
                      <div style={{ gridColumn: '1 / -1', padding: '8px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                        <div style={{ ...S.label, fontSize: '9px' }}>GIS Layer</div>
                        <div style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>🗺️ {response.details.gisLayer}</div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   AI PREDICTION CARD — per department
   ═══════════════════════════════════════════════════════════════════ */
const AIPredictionCard = ({ deptId, prediction }) => {
  const [expanded, setExpanded] = useState(false);
  const dept = getDeptById(deptId);
  if (!dept || !prediction) return null;

  return (
    <motion.div
      layout
      style={{
        ...S.glassSmall,
        borderLeft: `3px solid ${prediction.disagreesWithDept ? '#EF4444' : '#10B981'}`,
        cursor: 'pointer',
      }}
      whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ConfidenceRing value={prediction.confidence} size={44} stroke={4} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</div>
            <div style={{ fontSize: '11px', color: prediction.disagreesWithDept ? '#EF4444' : '#10B981', fontWeight: 600 }}>
              {prediction.disagreesWithDept ? '⚠️ AI Disagrees with Department' : prediction.predictsFutureWork ? '✅ AI Confirms Work Needed' : '✓ AI Agrees — No Work'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {prediction.predictsFutureWork && (
            <span style={S.badge('#FEF3C7', '#92400E')}>
              <Clock size={10} /> {prediction.timeframe}
            </span>
          )}
          {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={S.divider} />

            {/* DISAGREEMENT ALERT */}
            {prediction.disagreesWithDept && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
                padding: '12px', marginBottom: '12px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
                  ⚠️ Potential Future Requirement Detected
                </div>
                <div style={{ fontSize: '11px', color: '#7F1D1D' }}>{prediction.disagreementReason}</div>
              </div>
            )}

            {/* EVIDENCE */}
            <div style={{ marginBottom: '12px' }}>
              <div style={S.label}>Supporting Evidence ({prediction.historicalDataPoints} data points analyzed)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {prediction.evidence.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: dept.color, flexShrink: 0 }} />
                    {e}
                  </div>
                ))}
              </div>
            </div>

            {/* RISK FACTORS */}
            {prediction.riskFactors?.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={S.label}>Risk Factors</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {prediction.riskFactors.map((rf, i) => (
                    <span key={i} style={S.badge('#FEF3C7', '#92400E')}>{rf}</span>
                  ))}
                </div>
              </div>
            )}

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', background: 'var(--hover-bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ ...S.label, fontSize: '9px' }}>AI Budget Est.</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#6366F1' }}>₹{prediction.aiBudgetEstimate}L</div>
              </div>
              <div style={{ padding: '8px', background: 'var(--hover-bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ ...S.label, fontSize: '9px' }}>Expected Savings</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>₹{prediction.expectedSavings}L</div>
              </div>
              <div style={{ padding: '8px', background: 'var(--hover-bg)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ ...S.label, fontSize: '9px' }}>Env. Impact</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: prediction.environmentalImpact === 'Low' ? '#10B981' : '#F59E0B' }}>
                  {prediction.environmentalImpact}
                </div>
              </div>
            </div>

            {/* RISK + FORECASTS */}
            <RiskMeter score={prediction.riskScore} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <div style={{ padding: '6px 8px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                <div style={{ ...S.label, fontSize: '9px' }}>Population Forecast</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{prediction.populationForecast}</div>
              </div>
              <div style={{ padding: '6px 8px', background: 'var(--hover-bg)', borderRadius: '8px' }}>
                <div style={{ ...S.label, fontSize: '9px' }}>Traffic Forecast</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{prediction.trafficForecast}</div>
              </div>
            </div>

            {/* RECOMMENDATION */}
            <div style={{ marginTop: '10px', padding: '10px', background: '#EEF2FF', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#4338CA' }}>💡 AI Recommendation</div>
              <div style={{ fontSize: '11px', color: '#3730A3', marginTop: '2px' }}>{prediction.recommendation}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   BUDGET BAR CHART — for comparison panel
   ═══════════════════════════════════════════════════════════════════ */
const BudgetComparisonChart = ({ deptEstimate, aiEstimate, deptName }) => {
  if (!deptEstimate && !aiEstimate) return null;
  const data = [
    { name: 'Dept Est.', value: deptEstimate || 0, fill: '#6366F1' },
    { name: 'AI Est.', value: aiEstimate || 0, fill: '#10B981' },
    { name: 'Difference', value: Math.abs((deptEstimate || 0) - (aiEstimate || 0)), fill: '#F59E0B' },
  ];
  return (
    <div style={{ height: '100px', marginTop: '8px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v) => [`₹${v}L`, '']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PARALLEL COMPARISON PANEL — Department vs AI side-by-side
   ═══════════════════════════════════════════════════════════════════ */
const ComparisonPanel = ({ deptId, response, prediction, adminDecision, onDecision }) => {
  const dept = getDeptById(deptId);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showChart, setShowChart] = useState(false);
  if (!dept) return null;

  const hasResponded = !!response?.respondedAt;
  const agrees = !prediction?.disagreesWithDept;
  const deptBudget = response?.details?.estimatedCost;
  const aiBudget = prediction?.aiBudgetEstimate;

  const DECISION_LABELS = {
    approve_dept: { label: 'Dept Approved', color: '#10B981', bg: '#DCFCE7' },
    approve_ai: { label: 'AI Approved', color: '#6366F1', bg: '#EEF2FF' },
    merge: { label: 'Merged', color: '#0891B2', bg: '#CFFAFE' },
    review: { label: 'Under Review', color: '#F59E0B', bg: '#FEF3C7' },
    reject: { label: 'Rejected', color: '#EF4444', bg: '#FEE2E2' },
    override: { label: 'Overridden', color: '#7C3AED', bg: '#F3E8FF' },
  };

  const decisionInfo = adminDecision ? DECISION_LABELS[adminDecision.decision] : null;

  return (
    <div style={{
      ...S.glass, padding: '0', overflow: 'hidden',
      border: agrees ? '1px solid var(--border)' : '2px solid #FECACA',
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: `linear-gradient(135deg, ${dept.color}08, ${dept.color}03)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>{dept.icon}</span>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</span>
            {!agrees && prediction?.riskScore && (
              <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600, marginTop: '2px' }}>
                Risk Score: {prediction.riskScore}/10
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {!agrees && <span style={S.badge('#FEE2E2', '#991B1B')}>⚠️ AI Disagreement</span>}
          {decisionInfo && <span style={S.badge(decisionInfo.bg, decisionInfo.color)}>✓ {decisionInfo.label}</span>}
          {(deptBudget || aiBudget) && (
            <button onClick={() => setShowChart(!showChart)}
              style={{ ...S.btn('var(--hover-bg)', 'var(--text-muted)'), fontSize: '11px', padding: '4px 8px' }}>
              <BarChart3 size={12} /> Chart
            </button>
          )}
        </div>
      </div>

      {/* COMPARISON BODY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '160px' }}>
        {/* LEFT — Department */}
        <div style={{ padding: '16px', borderRight: '1px solid var(--border)' }}>
          <div style={{ ...S.label, fontSize: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Department Response
          </div>
          {!hasResponded ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <Clock size={20} style={{ marginBottom: '6px' }} />
              Awaiting Response
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current Work</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: response.currentWork === 'yes' ? '#16A34A' : '#DC2626' }}>
                  {response.currentWork === 'yes' ? 'YES' : 'NO'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Future Work</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: response.futureWork === 'yes' ? '#16A34A' : '#DC2626' }}>
                  {response.futureWork === 'yes' ? `YES (${response.futureWorkYears}yr)` : 'NO'}
                </span>
              </div>
              {response.noReason && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 8px', background: 'var(--hover-bg)', borderRadius: '6px' }}>
                  Reason: {response.noReason === 'work_completed' ? 'Work Completed' :
                    response.noReason === 'no_infrastructure_required' ? 'No Infrastructure Required' :
                      response.noReason === 'future_not_expected' ? 'Future Work Not Expected' : response.noReason}
                </div>
              )}
              {deptBudget && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#EEF2FF', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#4338CA' }}>Budget</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#4338CA' }}>₹{deptBudget}L</span>
                </div>
              )}
              {response.details?.utilityType && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Utility: <strong>{response.details.utilityType}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — AI */}
        <div style={{ padding: '16px', background: 'var(--hover-bg)' }}>
          <div style={{ ...S.label, fontSize: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Brain size={12} color="#6366F1" /> AI Prediction
          </div>
          {prediction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Future Work</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: prediction.predictsFutureWork ? '#16A34A' : '#DC2626' }}>
                  {prediction.predictsFutureWork ? `YES (${prediction.timeframe})` : 'NO'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confidence</span>
                <ConfidenceRing value={prediction.confidence} size={36} stroke={3} />
              </div>
              {aiBudget && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#DCFCE7', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#166534' }}>AI Budget</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>₹{aiBudget}L</span>
                </div>
              )}
              {deptBudget && aiBudget && (
                <div style={{ fontSize: '11px', fontWeight: 600, color: deptBudget > aiBudget ? '#10B981' : '#DC2626' }}>
                  {deptBudget > aiBudget
                    ? `↓ Save ₹${Math.round((deptBudget - aiBudget) * 10) / 10}L using AI estimate`
                    : `↑ AI est. higher by ₹${Math.round((aiBudget - deptBudget) * 10) / 10}L`}
                </div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                {prediction.recommendation?.substring(0, 90)}...
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analysis pending...</div>
          )}
        </div>
      </div>

      {/* BUDGET CHART */}
      <AnimatePresence>
        {showChart && (deptBudget || aiBudget) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', padding: '12px 18px' }}
          >
            <div style={{ ...S.label, marginBottom: '8px' }}>Budget Comparison (₹ Lakhs)</div>
            <BudgetComparisonChart deptEstimate={deptBudget} aiEstimate={aiBudget} deptName={dept.name} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN DECISION BAR */}
      <div style={{
        padding: '12px 18px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '8px',
        background: 'var(--card-bg)',
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'approve_dept', label: '✅ Approve Dept', bg: '#DCFCE7', color: '#166534' },
            { id: 'approve_ai', label: '🤖 Approve AI', bg: '#EEF2FF', color: '#4338CA' },
            { id: 'merge', label: '🔄 Merge', bg: '#CFFAFE', color: '#155E75' },
            { id: 'review', label: '📋 Review', bg: '#FEF3C7', color: '#92400E' },
            { id: 'reject', label: '❌ Reject', bg: '#FEE2E2', color: '#991B1B' },
          ].map(d => (
            <button key={d.id}
              style={{
                ...S.btn(adminDecision?.decision === d.id ? d.bg : 'var(--hover-bg)', adminDecision?.decision === d.id ? d.color : 'var(--text-muted)'),
                border: adminDecision?.decision === d.id ? `1px solid ${d.color}30` : '1px solid transparent',
                fontSize: '11px', padding: '5px 10px',
              }}
              onClick={() => onDecision(deptId, d.id)}
            >
              {d.label}
            </button>
          ))}
          <button
            style={{ ...S.btn('var(--hover-bg)', 'var(--text-muted)'), fontSize: '11px', padding: '5px 10px' }}
            onClick={() => setShowNoteInput(!showNoteInput)}
          >
            💬 Note / Override
          </button>
        </div>
        {adminDecision?.timestamp && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Decided: {new Date(adminDecision.timestamp).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* NOTE INPUT */}
      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
          >
            <div style={{ padding: '12px 18px', display: 'flex', gap: '8px' }}>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add clarification or override reason..."
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                  border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <button
                style={S.btn('#6366F1', '#fff')}
                onClick={() => {
                  onDecision(deptId, 'override', noteText);
                  setNoteText('');
                  setShowNoteInput(false);
                }}
              >
                Override
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   INTEGRATED SUMMARY VIEW
   ═══════════════════════════════════════════════════════════════════ */
const IntegratedSummary = ({ coordination, project, onFinalize }) => {
  const responses = coordination?.departmentResponses || {};
  const predictions = coordination?.aiPredictions || {};
  const decisions = coordination?.adminDecisions || {};
  const summary = coordination?.integratedSummary;
  const tender = coordination?.tenderRecommendation;
  const fundOpt = coordination?.fundOptimization;

  const deptStats = useMemo(() => {
    let current = 0, future = 0, aiDisagree = 0, decided = 0;
    DEPARTMENTS.forEach(d => {
      if (responses[d.id]?.currentWork === 'yes') current++;
      if (responses[d.id]?.futureWork === 'yes') future++;
      if (predictions[d.id]?.disagreesWithDept) aiDisagree++;
      if (decisions[d.id]) decided++;
    });
    return { current, future, aiDisagree, decided };
  }, [responses, predictions, decisions]);

  const AI_REC_LABELS = {
    proceed: { label: '✅ Proceed Immediately', color: '#10B981', bg: '#DCFCE7' },
    delay: { label: '⏸️ Delay Project', color: '#F59E0B', bg: '#FEF3C7' },
    merge: { label: '🔄 Merge Projects', color: '#0891B2', bg: '#CFFAFE' },
    integrated_tender: { label: '📋 Create Integrated Tender', color: '#6366F1', bg: '#EEF2FF' },
    separate_tender: { label: '📑 Create Separate Tenders', color: '#7C3AED', bg: '#F3E8FF' },
    schedule_future: { label: '📅 Schedule Future Work', color: '#EA580C', bg: '#FFEDD5' },
    monitor: { label: '📡 Monitor Area', color: '#0284C7', bg: '#E0F2FE' },
  };

  const isFinalized = !!summary;
  const respondedCount = DEPARTMENTS.filter(d => responses[d.id]?.respondedAt).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Departments', value: DEPARTMENTS.length, icon: <Users size={18} />, color: '#6366F1' },
          { label: 'Responded', value: `${respondedCount}/${DEPARTMENTS.length}`, icon: <CheckCircle2 size={18} />, color: respondedCount === DEPARTMENTS.length ? '#10B981' : '#F59E0B' },
          { label: 'Current Work', value: deptStats.current, icon: <Zap size={18} />, color: '#10B981' },
          { label: 'Future Work Planned', value: deptStats.future, icon: <Clock size={18} />, color: '#0891B2' },
          { label: 'AI Disagreements', value: deptStats.aiDisagree, icon: <AlertTriangle size={18} />, color: '#EF4444' },
          { label: 'Decisions Made', value: `${deptStats.decided}/${DEPARTMENTS.length}`, icon: <Award size={18} />, color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} style={{
            ...S.glassSmall,
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px',
          }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* DEPARTMENT SUMMARY TABLE */}
      <div style={{ ...S.glass, overflowX: 'auto' }}>
        <div style={S.sectionTitle}><Layers size={18} color="#6366F1" /> Integrated Project Summary</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {['Department', 'Status', 'Current Work', 'Future Work', 'AI Prediction', 'Confidence', 'Budget (Dept)', 'Budget (AI)', 'Admin Decision'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEPARTMENTS.map(dept => {
              const resp = responses[dept.id];
              const pred = predictions[dept.id];
              const dec = decisions[dept.id];
              const fallbackStatus = project?.departmentStatuses?.[dept.id];
              const hasResponded = resp?.respondedAt || (fallbackStatus && fallbackStatus !== 'pending' && fallbackStatus !== 'not_applicable');
              const hasCurrentWork = resp?.currentWork === 'yes' || fallbackStatus === 'yes';

              return (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>{dept.icon}</span> {dept.name}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {hasResponded
                      ? <span style={S.badge('#DCFCE7', '#166534')}>✓ Responded</span>
                      : <span style={S.badge('#FEF3C7', '#92400E')}>⏳ Pending</span>}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {hasCurrentWork
                      ? <span style={S.badge('#DCFCE7', '#166534')}>YES</span>
                      : hasResponded
                        ? <span style={S.badge('#FEE2E2', '#991B1B')}>NO</span>
                        : <span style={S.badge('#FEF3C7', '#92400E')}>–</span>}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {resp?.futureWork === 'yes'
                      ? <span style={S.badge('#DBEAFE', '#1E40AF')}>YES</span>
                      : hasResponded
                        ? <span style={S.badge('#F1F5F9', '#64748B')}>NO</span>
                        : <span style={S.badge('#FEF3C7', '#92400E')}>–</span>}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {pred?.predictsFutureWork
                      ? <span style={S.badge(pred.disagreesWithDept ? '#FEE2E2' : '#DCFCE7', pred.disagreesWithDept ? '#991B1B' : '#166534')}>
                          {pred.disagreesWithDept ? '⚠️ YES' : '✅ YES'}
                        </span>
                      : <span style={S.badge('#F1F5F9', '#64748B')}>NO</span>}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {pred && <ConfidenceRing value={pred.confidence} size={30} stroke={3} />}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                    {resp?.details?.estimatedCost ? `₹${resp.details.estimatedCost}L` : '–'}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: '#6366F1' }}>
                    {pred?.aiBudgetEstimate ? `₹${pred.aiBudgetEstimate}L` : '–'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    {dec ? (
                      <span style={S.badge(
                        dec.decision === 'approve_dept' ? '#DCFCE7' : dec.decision === 'approve_ai' ? '#EEF2FF' : dec.decision === 'reject' ? '#FEE2E2' : '#FEF3C7',
                        dec.decision === 'approve_dept' ? '#166534' : dec.decision === 'approve_ai' ? '#4338CA' : dec.decision === 'reject' ? '#991B1B' : '#92400E',
                      )}>
                        {dec.decision.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FINALIZE / AI RECOMMENDATION */}
      {!isFinalized ? (
        <div style={{ ...S.glass, textAlign: 'center', padding: '40px 20px' }}>
          <Brain size={44} color="#6366F1" style={{ marginBottom: '16px', opacity: 0.9 }} />
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Ready to Finalize Coordination?
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            Once finalized, the AI will generate an integrated project summary, optimize budgets across all departments, and recommend the best tender strategy.
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ ...S.glassSmall, textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#6366F1' }}>{deptStats.decided}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Decisions Made</div>
            </div>
            <div style={{ ...S.glassSmall, textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>{respondedCount}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Depts Responded</div>
            </div>
            <div style={{ ...S.glassSmall, textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444' }}>{deptStats.aiDisagree}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AI Flags</div>
            </div>
          </div>
          <button
            style={{ ...S.btn('#6366F1', '#fff'), padding: '14px 36px', fontSize: '14px', borderRadius: '12px', marginTop: '24px' }}
            onClick={onFinalize}
          >
            <Zap size={16} /> Finalize & Generate AI Recommendation
          </button>
        </div>
      ) : (
        <>
          {/* AI RECOMMENDATION CARD */}
          <div style={{
            ...S.glass,
            background: `linear-gradient(135deg, ${(AI_REC_LABELS[coordination.aiRecommendation]?.bg || '#EEF2FF')}80, var(--card-bg))`,
            border: `2px solid ${AI_REC_LABELS[coordination.aiRecommendation]?.color || '#6366F1'}20`,
          }}>
            <div style={S.sectionTitle}><Brain size={18} color="#6366F1" /> AI Project Recommendation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '12px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 800,
                background: AI_REC_LABELS[coordination.aiRecommendation]?.bg,
                color: AI_REC_LABELS[coordination.aiRecommendation]?.color,
              }}>
                {AI_REC_LABELS[coordination.aiRecommendation]?.label}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ ...S.glassSmall, textAlign: 'center' }}>
                <div style={S.label}>Participating Depts</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>{summary.participating}</div>
              </div>
              <div style={{ ...S.glassSmall, textAlign: 'center' }}>
                <div style={S.label}>AI-Flagged Future</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#F59E0B' }}>{summary.predictedFuture}</div>
              </div>
              <div style={{ ...S.glassSmall, textAlign: 'center' }}>
                <div style={S.label}>Dept Budget Total</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{summary.totalDeptBudget}L</div>
              </div>
              <div style={{ ...S.glassSmall, textAlign: 'center' }}>
                <div style={S.label}>AI Optimized Budget</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#6366F1' }}>₹{summary.optimizedBudget}L</div>
              </div>
              <div style={{ ...S.glassSmall, textAlign: 'center' }}>
                <div style={S.label}>Est. Savings</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>₹{summary.savings}L</div>
              </div>
            </div>
          </div>

          {/* TENDER RECOMMENDATION */}
          {tender && (
            <div style={{ ...S.glass }}>
              <div style={S.sectionTitle}><FileText size={18} color="#7C3AED" /> Tender Recommendation</div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  ...S.badge(tender.type === 'integrated' ? '#EEF2FF' : '#F3E8FF', tender.type === 'integrated' ? '#4338CA' : '#7C3AED'),
                  fontSize: '14px', padding: '8px 20px',
                }}>
                  {tender.type === 'integrated' ? '📋 Single Integrated Tender' : '📑 Separate Department Tenders'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                  Est. Savings: ₹{tender.estimatedSavings}L
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{tender.reason}</div>
              <div style={{ marginTop: '16px', padding: '12px', background: '#EEF2FF', borderRadius: '10px', border: '1px solid #C7D2FE' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#4338CA', marginBottom: '6px' }}>Tender Logic Factors</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Project Dependency', 'Timeline Alignment', 'Budget Optimization', 'Contractor Specialization', 'Utility Conflict Analysis'].map((f, i) => (
                    <span key={i} style={S.badge('#DBEAFE', '#1E40AF')}><Check size={10} /> {f}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FUND OPTIMIZATION TABLE */}
          {fundOpt && Object.keys(fundOpt).length > 0 && (
            <div style={{ ...S.glass, overflowX: 'auto' }}>
              <div style={S.sectionTitle}><DollarSign size={18} color="#16A34A" /> Fund Optimization</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Department', 'Dept Estimate', 'AI Estimate', 'Optimized', 'Savings', 'Funding Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fundOpt).map(([deptId, fund]) => {
                    const dept = getDeptById(deptId);
                    const saving = Math.round((fund.deptEstimate - fund.optimized) * 10) / 10;
                    return (
                      <tr key={deptId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{dept?.icon} {dept?.name}</td>
                        <td style={{ padding: '10px 8px' }}>₹{fund.deptEstimate}L</td>
                        <td style={{ padding: '10px 8px', color: '#6366F1', fontWeight: 600 }}>₹{fund.aiEstimate}L</td>
                        <td style={{ padding: '10px 8px', color: '#10B981', fontWeight: 700 }}>₹{fund.optimized}L</td>
                        <td style={{ padding: '10px 8px', color: saving > 0 ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>
                          {saving > 0 ? `↓ ₹${saving}L` : '–'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          {fund.fundingAvailable
                            ? <span style={S.badge('#DCFCE7', '#166534')}>✓ Available</span>
                            : <span style={S.badge('#FEF3C7', '#92400E')}>⚠ Request Needed</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* DECISION AUDIT LOG */}
      {coordination?.decisionLog?.length > 0 && (
        <div style={S.glass}>
          <div style={S.sectionTitle}><Shield size={18} color="#0891B2" /> Decision Audit Trail</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
            {coordination.decisionLog.map((log, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px 12px',
                background: i % 2 === 0 ? 'var(--hover-bg)' : 'transparent', borderRadius: '8px',
              }}>
                <div style={{ minWidth: '120px', fontSize: '10px', color: 'var(--text-muted)', paddingTop: '2px' }}>
                  {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.action}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    by {log.actor} {log.notes && `— ${log.notes}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT — AI COORDINATION ENGINE
   ═══════════════════════════════════════════════════════════════════ */
export default function AICoordinationEngine() {
  const {
    projects,
    submitAdminCoordinationDecision,
    finalizeCoordination,
    awardTender,
    releaseMilestonePayout,
  } = useGovContext();

  const coordProjects = projects.filter(p => p.aiCoordination);
  const [selectedProjectId, setSelectedProjectId] = useState(coordProjects[0]?.id || '');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    if (!selectedProjectId && coordProjects.length > 0) {
      setSelectedProjectId(coordProjects[0].id);
    }
  }, [coordProjects, selectedProjectId]);

  const project = projects.find(p => p.id === selectedProjectId);
  
  // Merge departmentStatuses into aiCoordination so that even if they didn't use the form (or used emergency override), they show up correctly.
  const coordination = useMemo(() => {
    if (!project?.aiCoordination) return null;
    const cloned = JSON.parse(JSON.stringify(project.aiCoordination));
    if (project.departmentStatuses) {
      DEPARTMENTS.forEach(dept => {
        const status = project.departmentStatuses[dept.id];
        if (status && status !== 'pending' && status !== 'not_applicable') {
          if (!cloned.departmentResponses) cloned.departmentResponses = {};
          if (!cloned.departmentResponses[dept.id] || !cloned.departmentResponses[dept.id].respondedAt) {
            cloned.departmentResponses[dept.id] = {
              ...(cloned.departmentResponses[dept.id] || {}),
              currentWork: status === 'yes' ? 'yes' : 'no',
              futureWork: 'no',
              respondedAt: project.createdAt || new Date().toISOString()
            };
          }
        }
      });
    }
    return cloned;
  }, [project]);

  const handleDecision = (deptId, decision, notes = '') => {
    submitAdminCoordinationDecision(selectedProjectId, deptId, decision, notes);
  };

  const handleFinalize = () => {
    finalizeCoordination(selectedProjectId);
  };

  // Quick stats for header
  const pendingCount = coordination
    ? DEPARTMENTS.filter(d => !coordination.departmentResponses?.[d.id]?.respondedAt).length
    : 0;
  const disagreeCount = coordination
    ? DEPARTMENTS.filter(d => coordination.aiPredictions?.[d.id]?.disagreesWithDept).length
    : 0;

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: <Gauge size={14} /> },
    { id: 'responses', label: 'Dept Responses', icon: <Users size={14} /> },
    { id: 'ai-analysis', label: 'AI Analysis', icon: <Brain size={14} /> },
    { id: 'comparison', label: 'Comparison & Decisions', icon: <BarChart3 size={14} /> },
    { id: 'summary', label: 'Summary & Tender', icon: <FileText size={14} /> },
    { id: 'bids', label: 'Bid Evaluation', icon: <Check size={14} /> },
    { id: 'execution', label: 'Execution & Milestones', icon: <Hammer size={14} /> },
  ];

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={{ ...S.glass, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={24} color="#6366F1" />
            AI Infrastructure Planning Engine
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Coordinate all departments before any infrastructure project is approved for tender
          </div>
          {coordination && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {pendingCount > 0 && <span style={S.badge('#FEF3C7', '#92400E')}>⏳ {pendingCount} depts pending</span>}
              {disagreeCount > 0 && <span style={S.badge('#FEE2E2', '#991B1B')}>⚠️ {disagreeCount} AI flags</span>}
              {coordination.integratedSummary && <span style={S.badge('#DCFCE7', '#166534')}>✅ Finalized</span>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Project:</label>
          <select
            value={selectedProjectId}
            onChange={e => { setSelectedProjectId(e.target.value); setActiveView('overview'); }}
            style={{
              padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)',
              outline: 'none', cursor: 'pointer', minWidth: '260px',
            }}
          >
            {coordProjects.map(p => (
              <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
            ))}
            {coordProjects.length === 0 && <option value="">No projects with coordination data</option>}
          </select>
        </div>
      </div>

      {!coordination ? (
        <div style={{ ...S.glass, textAlign: 'center', padding: '60px 20px' }}>
          <Brain size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>
            No coordination data available for this project.
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Create a new project to trigger the AI coordination workflow.
          </div>
        </div>
      ) : (
        <>
          {/* WORKFLOW TIMELINE */}
          <WorkflowTimeline coordination={coordination} />

          {/* VIEW TABS */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {viewTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                style={{
                  ...S.btn(
                    activeView === tab.id ? '#6366F1' : 'var(--card-bg)',
                    activeView === tab.id ? '#fff' : 'var(--text-muted)'
                  ),
                  border: activeView === tab.id ? 'none' : '1px solid var(--border)',
                  padding: '8px 16px',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* VIEW CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* OVERVIEW */}
              {activeView === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ProjectMeta project={project} />
                  <IntegratedSummary
                    coordination={coordination}
                    project={project}
                    onFinalize={handleFinalize}
                  />
                </div>
              )}

              {/* DEPARTMENT RESPONSES */}
              {activeView === 'responses' && (
                <div>
                  <div style={{ ...S.sectionTitle, marginBottom: '16px' }}>
                    <Users size={18} color="#0891B2" /> Department Questionnaire Responses
                    <span style={{ ...S.badge('#EEF2FF', '#4338CA'), marginLeft: '4px' }}>
                      {DEPARTMENTS.filter(d => coordination.departmentResponses?.[d.id]?.respondedAt).length}/{DEPARTMENTS.length} Responded
                    </span>
                  </div>
                  <div style={S.grid2}>
                    {DEPARTMENTS.map(dept => (
                      <DeptResponseCard
                        key={dept.id}
                        deptId={dept.id}
                        projectId={selectedProjectId}
                        response={coordination.departmentResponses?.[dept.id]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* AI ANALYSIS */}
              {activeView === 'ai-analysis' && (
                <div>
                  <div style={{ ...S.sectionTitle, marginBottom: '16px' }}>
                    <Brain size={18} color="#6366F1" /> AI Independent Validation & Predictions
                  </div>
                  <div style={{ ...S.glassSmall, marginBottom: '16px', background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#4338CA', marginBottom: '6px' }}>
                      🤖 AI Analysis Methodology
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Historical Projects', 'Population Growth', 'Traffic Growth', 'Smart City Plans', 'Building Permits', 'Complaint History', 'Infrastructure Age', 'Utility Demand', 'Budget History', 'Urban Expansion', 'Satellite Data', 'Flood History'].map((m, i) => (
                        <span key={i} style={S.badge('#DBEAFE', '#1E40AF')}>{m}</span>
                      ))}
                    </div>
                  </div>
                  <div style={S.grid2}>
                    {DEPARTMENTS.map(dept => (
                      <AIPredictionCard
                        key={dept.id}
                        deptId={dept.id}
                        prediction={coordination.aiPredictions?.[dept.id]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* COMPARISON */}
              {activeView === 'comparison' && (
                <div>
                  <div style={{ ...S.sectionTitle, marginBottom: '16px' }}>
                    <BarChart3 size={18} color="#7C3AED" /> Department vs AI — Parallel Comparison & Admin Decisions
                  </div>
                  <div style={{ ...S.glassSmall, marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Legend:</div>
                    <span style={S.badge('#DCFCE7', '#166534')}>✅ Approve Dept</span>
                    <span style={S.badge('#EEF2FF', '#4338CA')}>🤖 Approve AI</span>
                    <span style={S.badge('#CFFAFE', '#155E75')}>🔄 Merge Both</span>
                    <span style={S.badge('#FEF3C7', '#92400E')}>📋 Request Review</span>
                    <span style={S.badge('#FEE2E2', '#991B1B')}>❌ Reject</span>
                    <span style={S.badge('#F3E8FF', '#7C3AED')}>⚡ Override</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {DEPARTMENTS.map(dept => (
                      <ComparisonPanel
                        key={dept.id}
                        deptId={dept.id}
                        response={coordination.departmentResponses?.[dept.id]}
                        prediction={coordination.aiPredictions?.[dept.id]}
                        adminDecision={coordination.adminDecisions?.[dept.id]}
                        onDecision={handleDecision}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SUMMARY & TENDER */}
              {activeView === 'summary' && (
                <IntegratedSummary
                  coordination={coordination}
                  project={project}
                  onFinalize={handleFinalize}
                />
              )}

              {/* BID EVALUATION */}
              {activeView === 'bids' && (
                <motion.div key="bids" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={S.glass}>
                    <div style={S.sectionTitle}><Check size={18} color="#10B981" /> Contractor Bid Evaluation</div>
                    {!project?.bids || project.bids.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>No bids have been submitted yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {project.bids.map((bid, i) => (
                          <div key={i} style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1.1rem' }}>{bid.contractorEmail}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                Quoted Amount: <strong style={{ color: '#10B981' }}>₹{bid.amount}L</strong> • Duration: <strong>{bid.duration} Months</strong>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{bid.notes}</div>
                            </div>
                            <div>
                              {project.awardedBid?.contractorEmail === bid.contractorEmail ? (
                                <span style={{ ...S.badge('#DCFCE7', '#166534'), padding: '8px 16px', fontSize: '14px' }}>Tender Awarded</span>
                              ) : project.awardedBid ? (
                                <span style={{ ...S.badge('#F1F5F9', '#94A3B8'), padding: '8px 16px', fontSize: '14px' }}>Not Selected</span>
                              ) : (
                                <button
                                  onClick={() => awardTender(project.id, bid)}
                                  style={{ ...S.btn('#10B981', 'white'), padding: '10px 20px', fontSize: '14px' }}
                                >
                                  Award Tender
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {/* EXECUTION & MILESTONES */}
              {activeView === 'execution' && (
                <motion.div key="execution" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={S.glass}>
                    <div style={S.sectionTitle}><Hammer size={18} color="#F59E0B" /> Sequential Master Plan Execution</div>
                    
                    {!project.budgetSanctioned ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <AlertTriangle size={32} style={{ margin: '0 auto 12px', color: '#F59E0B' }} />
                        <p>Waiting for Finance Department to sanction the budget.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ fontWeight: 800, color: '#166534', marginBottom: '4px' }}>Project Budget Sanctioned</h4>
                            <p style={{ fontSize: '0.85rem', color: '#15803D' }}>Total Escrow Allocated: ₹{project.amount}L</p>
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>{project.progress || 0}% Complete</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI Mandated Execution Sequence</h4>
                          
                          {/* MOCK MILESTONES SEQUENCE */}
                          {[
                            { step: 1, name: 'Underground Utilities (Water/Sewage)', targetDept: 'dept-3', percent: 30, payout: Math.round(project.amount * 0.3) },
                            { step: 2, name: 'Telecom & Fiber Optics', targetDept: 'dept-6', percent: 60, payout: Math.round(project.amount * 0.2) },
                            { step: 3, name: 'Road Surface Construction (PWD)', targetDept: 'dept-1', percent: 100, payout: Math.round(project.amount * 0.5) },
                          ].map((milestone, idx) => {
                            const isPaid = project.paidMilestones?.some(m => m.note.includes(milestone.name));
                            const isNext = !isPaid && (idx === 0 || project.paidMilestones?.some(m => m.note.includes(`Step ${idx}`)));
                            
                            return (
                              <div key={milestone.step} style={{ 
                                padding: '16px', borderRadius: '12px', 
                                background: isPaid ? '#F8FAFC' : isNext ? 'white' : '#F8FAFC',
                                border: `2px solid ${isPaid ? '#E2E8F0' : isNext ? '#6366F1' : '#E2E8F0'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                opacity: isPaid || isNext ? 1 : 0.6
                              }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isPaid ? '#10B981' : isNext ? '#6366F1' : '#94A3B8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                      {isPaid ? <Check size={14} /> : milestone.step}
                                    </span>
                                    <h5 style={{ fontWeight: 700, color: isPaid ? '#94A3B8' : 'var(--text-primary)', textDecoration: isPaid ? 'line-through' : 'none' }}>
                                      {milestone.name}
                                    </h5>
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Milestone Payout: <strong>₹{milestone.payout}L</strong>
                                  </div>
                                </div>
                                <div>
                                  {isPaid ? (
                                    <span style={S.badge('#DCFCE7', '#166534')}>Funded & Completed</span>
                                  ) : isNext ? (
                                    <button 
                                      onClick={() => {
                                        releaseMilestonePayout(project.id, milestone.payout, `Step ${milestone.step}: ${milestone.name}`);
                                      }}
                                      style={{ ...S.btn('#6366F1', 'white'), padding: '8px 16px', fontSize: '12px' }}
                                    >
                                      Verify & Release ₹{milestone.payout}L
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Locked (Sequential)</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
