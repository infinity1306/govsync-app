import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import { useGovContext } from '../context/GovContext';
import {
  Network, Brain, Zap, BarChart3, Shield, Leaf, Car, Users,
  CloudRain, Database, Satellite, MapPin, AlertTriangle,
  CheckCircle2, ArrowLeft, ChevronRight, TrendingDown, Clock,
  DollarSign, Activity, Eye, ThumbsUp, ThumbsDown, FileText,
  Layers, Workflow, Cpu, Sparkles, ArrowRight, CircleDot,
  MessageCircle, X, Send
} from 'lucide-react';

// --- Mock AI Analysis Data ---
const AI_REPORT = {
  proposal: {
    dept: 'Water Resources Department',
    task: 'Replace 2 km pipeline in Sector 7, Bhopal',
    method: 'Open-cut excavation',
    cost: 4.00,
    duration: 30,
  },
  recommendation: {
    method: 'Horizontal Directional Drilling (HDD)',
    reason: 'Avoids damaging the newly constructed road and minimizes traffic disruption. HDD is a trenchless technology that drills underground without surface excavation.',
    cost: 3.55,
    duration: 22,
    savings: 0.45,
    trafficReduction: 65,
    carbonReduction: 18,
    riskLevel: 'Low',
    confidenceScore: 96,
  },
  comparison: [
    { metric: 'Cost', proposal: '₹4.00 Cr', ai: '₹3.55 Cr', winner: 'ai' },
    { metric: 'Duration', proposal: '30 Days', ai: '22 Days', winner: 'ai' },
    { metric: 'Method', proposal: 'Open Road Excavation', ai: 'Trenchless HDD', winner: 'ai' },
    { metric: 'Traffic Impact', proposal: 'High', ai: 'Low', winner: 'ai' },
    { metric: 'Citizen Disturbance', proposal: 'High', ai: 'Minimal', winner: 'ai' },
    { metric: 'Future Maintenance', proposal: 'Moderate', ai: 'Low', winner: 'ai' },
    { metric: 'Environmental Impact', proposal: 'Medium', ai: 'Lower', winner: 'ai' },
    { metric: 'Risk', proposal: 'Medium', ai: 'Low', winner: 'ai' },
  ],
  suggestions: [
    'Complete pipeline replacement before road surfacing.',
    'Install telecom ducts simultaneously to avoid future excavation.',
    'Lay spare utility conduits for future expansion.',
    'Schedule work during low-traffic hours (10 PM – 6 AM).',
    'Use prefabricated drainage chambers for faster deployment.',
    'Release milestone-based funding via smart escrow.',
    'Deploy drone inspection after completion for verification.',
  ],
  riskAlerts: [
    { severity: 'high', text: 'Heavy rainfall expected within two weeks.' },
    { severity: 'high', text: 'Nearby hospital requires uninterrupted emergency access.' },
    { severity: 'medium', text: 'School zone traffic peaks between 7:30–9:00 AM and 2:30–4:00 PM.' },
    { severity: 'high', text: 'Existing gas pipeline detected within the excavation corridor.' },
    { severity: 'medium', text: 'Underground electricity cable located 1.2 meters from proposed trench.' },
  ],
  decisionScores: [
    { label: 'Cost Optimization', score: 92 },
    { label: 'Time Optimization', score: 95 },
    { label: 'Traffic Impact', score: 90 },
    { label: 'Environmental', score: 88 },
    { label: 'Safety', score: 97 },
    { label: 'Future Readiness', score: 94 },
  ],
  overallScore: 93,
  dataSources: [
    'Government GIS layers', 'Satellite imagery', 'Aerial imagery',
    'Road inventory', 'Underground utility records', 'Traffic sensors',
    'GPS mobility data', 'Citizen grievance portal', 'Weather forecasts',
    'Historical project database', 'Department submissions'
  ],
  analysisModules: [
    { icon: Database, label: 'Infrastructure Data', items: ['Existing road age', 'Previous repair history', 'Underground utility records', 'Drainage layout', 'Utility congestion'] },
    { icon: Satellite, label: 'Satellite & Aerial Data', items: ['Satellite imagery', 'Road width', 'Nearby buildings', 'Land use & vegetation', 'Flood-prone zones'] },
    { icon: Car, label: 'Traffic Intelligence', items: ['Peak traffic hours', 'Average daily vehicle count', 'Public transport routes', 'Emergency vehicle access', 'Alternate routes'] },
    { icon: Users, label: 'Citizen Feedback', items: ['Complaint history', 'Social media reports', 'Public suggestions', 'Road quality ratings', 'Water leakage complaints'] },
    { icon: Leaf, label: 'Environmental Analysis', items: ['Rainfall forecast', 'Flood risk', 'Soil conditions', 'Heat impact', 'Nearby vegetation'] },
    { icon: DollarSign, label: 'Financial Analysis', items: ['Material prices', 'Labour costs', 'Budget availability', 'Historical project costs'] },
    { icon: FileText, label: 'Historical Projects', items: ['Similar completed projects', 'Average completion time', 'Delay patterns', 'Contractor performance'] },
  ],
};

// --- Score Ring Component ---
function ScoreRing({ score, size = 80, strokeWidth = 6, color = '#6366F1' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// --- Analysis Step Indicator ---
function AnalysisStep({ icon: Icon, label, done, active }) {
  return (
    <motion.div
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
        borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600,
        background: done ? '#F0FDF4' : active ? '#EEF2FF' : '#F8FAFC',
        color: done ? '#166534' : active ? '#4338CA' : '#94A3B8',
        border: `1px solid ${done ? '#BBF7D0' : active ? '#C7D2FE' : '#E2E8F0'}`,
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {done ? <CheckCircle2 size={18} /> : active ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Cpu size={18} /></motion.div> : <CircleDot size={18} />}
      {label}
    </motion.div>
  );
}


export default function AIAdvisor() {
  const { projects, aiWarnings } = useGovContext();
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get('dept') || 'water';
  const headerColor = deptId === 'water' ? '#38BDF8' : '#F59E0B';

  // Phases: 'form' -> 'analyzing' -> 'report'
  const [phase, setPhase] = useState('form');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [decision, setDecision] = useState(null); // 'accept' | 'reject' | 'modify'
  const [provider, setProvider] = useState('gemini'); // 'gemini' | 'groq'

  // Form state
  const [formData, setFormData] = useState({
    projectName: 'Sector 7 Pipeline Replacement',
    description: 'Replace 2 km aging water supply pipeline in Sector 7, Bhopal. Current pipeline is 25 years old with frequent leakage complaints.',
    method: 'Open-cut excavation',
    cost: '4.00',
    duration: '30',
  });

  const analysisLabels = [
    'Scanning infrastructure records...',
    'Processing satellite imagery...',
    'Analyzing traffic patterns...',
    'Mining citizen feedback...',
    'Evaluating environmental data...',
    'Running financial models...',
    'Cross-referencing historical projects...',
    'Generating optimized recommendation...',
    'Generating insights & suggestions...',
  ];

  // Analysis animation
  useEffect(() => {
    if (phase !== 'analyzing') return;
    if (analysisStep >= analysisLabels.length) {
      return; // Wait for API to finish
    }
    const timer = setTimeout(() => setAnalysisStep(prev => prev + 1), 800);
    return () => clearTimeout(timer);
  }, [phase, analysisStep]);

  const [report, setReport] = useState(AI_REPORT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalysisStep(0);
    setPhase('analyzing');

    try {
      const prompt = `
      You are an expert infrastructure AI advisor. Analyze this project proposal and provide a JSON response matching this schema EXACTLY:
      {
        "proposal": { "dept": "string", "task": "string", "method": "string", "cost": number, "duration": number },
        "recommendation": { "method": "string", "reason": "string", "cost": number, "duration": number, "savings": number, "trafficReduction": number, "carbonReduction": number, "riskLevel": "Low" | "Medium" | "High", "confidenceScore": number },
        "comparison": [ 
          { "metric": "Cost", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" },
          { "metric": "Duration", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" },
          { "metric": "Method", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" },
          { "metric": "Traffic Impact", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" },
          { "metric": "Citizen Disturbance", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" },
          { "metric": "Environmental Impact", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" },
          { "metric": "Risk", "proposal": "string", "ai": "string", "winner": "ai" | "proposal" }
        ],
        "suggestions": [ "string", "string", "string", "string" ],
        "riskAlerts": [ { "severity": "high" | "medium" | "low", "text": "string" } ],
        "decisionScores": [ 
          { "label": "Cost Optimization", "score": number },
          { "label": "Time Optimization", "score": number },
          { "label": "Traffic Impact", "score": number },
          { "label": "Environmental", "score": number },
          { "label": "Safety", "score": number },
          { "label": "Future Readiness", "score": number }
        ],
        "overallScore": number,
        "dataSources": [ "string", "string", "string" ]
      }
      
      Project details:
      Name: ${formData.projectName}
      Description: ${formData.description}
      Proposed Method: ${formData.method}
      Est. Cost: ${formData.cost} Cr
      Duration: ${formData.duration} days
      
      Generate a highly realistic, innovative infrastructure recommendation that is superior to the proposed method. Ensure the output is valid JSON. Do not include markdown code block formatting like \`\`\`json. Return only the raw JSON.
      `;

      let parsedData;
      let usedProvider = provider;
      try {
        const { askAI } = await import('../utils/aiClient');
        const res = await askAI(prompt, 'json');
        parsedData = res.data;
        usedProvider = res.provider;
      } catch (err) {
        console.error("AI Client failed, using mock data", err);
        parsedData = AI_REPORT;
        usedProvider = 'fallback';
      }

      parsedData.analysisModules = AI_REPORT.analysisModules;
      
      setReport(parsedData);
      setAnalysisStep(analysisLabels.length);
      setPhase('report');
    } catch (err) {
      console.error("AI API Call Failed, falling back to mock data:", err);
      // Fallback
      setReport(AI_REPORT);
      setAnalysisStep(analysisLabels.length);
      setPhase('report');
    }
  };

  return (
    <div className="dashboard-layout" style={{ background: '#F1F5F9' }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ background: 'var(--primary)', borderRight: 'none' }}>
        <div className="dash-logo" style={{ borderBottom: '1px solid var(--border)' }}>
          <Brain color="#A78BFA" size={28} />
          <h2 style={{ color: 'white', fontSize: '1.1rem' }}>AI Advisor</h2>
        </div>
        <div style={{ padding: '0 24px', marginBottom: '24px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Infrastructure Intelligence
        </div>
        <nav className="dash-nav" style={{ gap: '2px' }}>
          <div style={{ padding: '12px 16px', color: '#94A3B8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Analysis Modules
          </div>
          {report.analysisModules.map((mod, i) => {
            const Icon = mod.icon;
            const done = phase === 'report' || (phase === 'analyzing' && analysisStep > i);
            const active = phase === 'analyzing' && analysisStep === i;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                borderRadius: '8px', margin: '0 8px', fontSize: '0.85rem', fontWeight: 500,
                color: done ? '#4ADE80' : active ? '#A78BFA' : '#475569',
                background: active ? 'rgba(167,139,250,0.1)' : 'transparent',
                transition: 'all 0.3s',
              }}>
                <Icon size={16} />
                <span>{mod.label}</span>
                {done && <CheckCircle2 size={14} style={{ marginLeft: 'auto', color: '#4ADE80' }} />}
              </div>
            );
          })}
          <Link to={`/dashboard/dept/${deptId}`} className="dash-nav-item" style={{ marginTop: 'auto', color: '#94A3B8' }}>
            <ArrowLeft size={20} /> Back to {deptId === 'water' ? 'Water' : 'PWD'} Portal
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main" style={{ background: '#F1F5F9' }}>
        <header className="dash-header" style={{ background: 'var(--primary)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="#A78BFA" /> GovSync AI Infrastructure Advisor
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Intelligent second opinion for government infrastructure projects</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Shield size={16} color="#4ADE80" /> Human-in-the-Loop · AI Recommends, Officials Decide
          </div>
        </header>

        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* ===== PHASE 1: FORM ===== */}
          <AnimatePresence mode="wait">
          {phase === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ maxWidth: '720px', margin: '40px auto', padding: '0 32px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div style={{ width: '72px', height: '72px', margin: '0 auto 16px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366F1 0%, #A78BFA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={36} color="white" />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Submit Project Proposal</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Enter your department's project plan. AI will analyze it against 7 data intelligence modules and generate an optimized recommendation.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Engine Provider</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '6px' }}>
                    <div 
                      onClick={() => setProvider('gemini')}
                      style={{
                        padding: '16px', borderRadius: '12px', border: `2px solid ${provider === 'gemini' ? '#6366F1' : '#E2E8F0'}`,
                        background: provider === 'gemini' ? 'rgba(99,102,241,0.04)' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: provider === 'gemini' ? '#4f46e5' : '#1e293b' }}>Google Gemini ✨</span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>High-reasoning optimization (gemini-2.0-flash)</span>
                    </div>
                    <div 
                      onClick={() => setProvider('groq')}
                      style={{
                        padding: '16px', borderRadius: '12px', border: `2px solid ${provider === 'groq' ? '#6366F1' : '#E2E8F0'}`,
                        background: provider === 'groq' ? 'rgba(99,102,241,0.04)' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: provider === 'groq' ? '#4f46e5' : '#1e293b' }}>Groq Llama 🚀</span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Ultra-fast execution (llama-3.3-70b-versatile)</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project Name</label>
                  <input type="text" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description & Scope</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Proposed Method</label>
                    <input type="text" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Est. Cost (₹ Cr)</label>
                    <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Duration (Days)</label>
                    <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
                  </div>
                </div>
                <button type="submit" style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                  color: 'white', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  fontFamily: 'inherit', transition: 'all 0.3s',
                }}>
                  <Brain size={20} /> Run AI Analysis <ChevronRight size={20} />
                </button>
              </form>
            </motion.div>
          )}

          {/* ===== PHASE 2: ANALYZING ===== */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ maxWidth: '600px', margin: '60px auto', padding: '0 32px', textAlign: 'center' }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 40px rgba(99,102,241,0.3)', '0 0 0px rgba(99,102,241,0)'] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: '100px', height: '100px', margin: '0 auto 24px', borderRadius: '28px', background: 'linear-gradient(135deg, #6366F1, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Brain size={48} color="white" />
              </motion.div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>AI Analysis in Progress</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Processing {formData.projectName} against 7 intelligence modules...</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                {analysisLabels.map((label, i) => (
                  <AnalysisStep
                    key={i}
                    icon={Cpu}
                    label={label}
                    done={analysisStep > i}
                    active={analysisStep === i}
                  />
                ))}
              </div>

              <div style={{ marginTop: '24px', background: '#E2E8F0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6366F1, #A855F7)', borderRadius: '8px' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${(analysisStep / analysisLabels.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '8px' }}>{Math.round((analysisStep / analysisLabels.length) * 100)}% Complete</p>
            </motion.div>
          )}

          {/* ===== PHASE 3: REPORT ===== */}
          {phase === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 32px 60px' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={22} color="#6366F1" /> AI Recommendation Report
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>Generated for: {report.proposal.dept} · {formData.projectName}</p>
                </div>
                <button onClick={() => { setPhase('form'); setDecision(null); }} className="btn" style={{ background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} /> New Analysis
                </button>
              </div>

              {/* Overall Score Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: '20px', padding: '32px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px',
                  border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', right: '-30px', top: '-30px', opacity: 0.04 }}><Brain size={250} color="white" /></div>
                <div style={{ zIndex: 2 }}>
                  <p style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>AI Recommended Technique</p>
                  <h3 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800 }}>{report.recommendation.method}</h3>
                  <p style={{ color: '#A78BFA', fontSize: '0.92rem', marginTop: '8px', maxWidth: '500px', lineHeight: 1.5 }}>{report.recommendation.reason}</p>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cost</p>
                      <p style={{ color: '#4ADE80', fontWeight: 800, fontSize: '1.1rem' }}>₹{report.recommendation.cost} Cr</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Duration</p>
                      <p style={{ color: '#38BDF8', fontWeight: 800, fontSize: '1.1rem' }}>{report.recommendation.duration} Days</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Savings</p>
                      <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: '1.1rem' }}>₹{report.recommendation.savings * 100} Lakhs</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Risk</p>
                      <p style={{ color: '#4ADE80', fontWeight: 800, fontSize: '1.1rem' }}>{report.recommendation.riskLevel}</p>
                    </div>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <ScoreRing score={report.overallScore} size={120} strokeWidth={8} color="#A78BFA" />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'rotate(0deg)' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{report.overallScore}</span>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>/ 100</span>
                    </div>
                  </div>
                  <p style={{ color: '#A78BFA', fontSize: '0.78rem', fontWeight: 700, marginTop: '8px' }}>CONFIDENCE: {report.recommendation.confidenceScore}%</p>
                </div>
              </motion.div>

              {/* Key Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                  { label: 'Cost Saved', value: `₹${report.recommendation.savings * 100}L`, sub: '11% reduction', color: '#10B981', icon: TrendingDown },
                  { label: 'Time Saved', value: '8 Days', sub: '27% faster', color: '#3B82F6', icon: Clock },
                  { label: 'Traffic Reduction', value: `${report.recommendation.trafficReduction}%`, sub: 'Less disruption', color: '#F59E0B', icon: Car },
                  { label: 'Carbon Reduced', value: `${report.recommendation.carbonReduction}%`, sub: 'Lower emissions', color: '#10B981', icon: Leaf },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                      style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Icon size={22} />
                      </div>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.label}</p>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: item.color }}>{item.sub}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Comparison Table */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={20} color="#6366F1" /> Comparison: Department Proposal vs AI Recommendation
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Metric</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#EF4444' }}>Dept. Proposal</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#6366F1' }}>AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.comparison.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: '0.92rem' }}>{row.metric}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>{row.proposal}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#6366F1' }}>
                          {row.ai} {row.winner === 'ai' && <CheckCircle2 size={14} style={{ marginLeft: '4px', color: '#10B981' }} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Decision Scores */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#6366F1" /> AI Decision Scores
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {report.decisionScores.map((item, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                        <ScoreRing score={item.score} size={80} strokeWidth={6} color={item.score >= 95 ? '#10B981' : item.score >= 90 ? '#6366F1' : '#F59E0B'} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.score}%</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginTop: '10px' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Suggestions + Risk Alerts side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                {/* Suggestions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534' }}>
                    <CheckCircle2 size={18} /> AI Optimization Suggestions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {report.suggestions.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', fontSize: '0.88rem', color: '#14532D' }}>
                        <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        {s}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Risk Alerts */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B' }}>
                    <AlertTriangle size={18} /> Risk Alerts
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {report.riskAlerts.map((alert, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', borderRadius: '8px', fontSize: '0.88rem',
                        background: alert.severity === 'high' ? '#FEF2F2' : '#FFFBEB',
                        border: `1px solid ${alert.severity === 'high' ? '#FEE2E2' : '#FDE68A'}`,
                        color: alert.severity === 'high' ? '#991B1B' : '#92400E',
                      }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        {alert.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Data Sources */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={18} color="#6366F1" /> Data Sources Used
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {report.dataSources.map((src, i) => (
                    <span key={i} style={{ padding: '6px 14px', background: '#EEF2FF', color: '#4338CA', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #C7D2FE' }}>
                      {src}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Human-in-the-Loop Decision */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', borderRadius: '20px', padding: '36px', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
                <Shield size={36} color="#A78BFA" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Human-in-the-Loop Decision</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                  The AI provides recommendations only. Final approval remains with the authorized government engineer or project coordinator.
                </p>

                {!decision ? (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                    <button onClick={() => setDecision('accept')} className="btn" style={{
                      padding: '12px 28px', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px',
                    }}>
                      <ThumbsUp size={18} /> Accept AI Recommendation
                    </button>
                    <button onClick={() => setDecision('modify')} className="btn" style={{
                      padding: '12px 28px', background: '#F59E0B', color: 'black', fontWeight: 700, fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px',
                    }}>
                      <FileText size={18} /> Modify & Proceed
                    </button>
                    <button onClick={() => setDecision('reject')} className="btn" style={{
                      padding: '12px 28px', background: '#EF4444', color: 'white', fontWeight: 700, fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px',
                    }}>
                      <ThumbsDown size={18} /> Proceed with Original Plan
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', borderRadius: '14px',
                      background: decision === 'accept' ? 'rgba(16,185,129,0.15)' : decision === 'modify' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      border: `1px solid ${decision === 'accept' ? '#10B981' : decision === 'modify' ? '#F59E0B' : '#EF4444'}`,
                    }}>
                      <CheckCircle2 size={24} color={decision === 'accept' ? '#10B981' : decision === 'modify' ? '#F59E0B' : '#EF4444'} />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: 'white', fontSize: '1rem' }}>
                          {decision === 'accept' ? 'AI Recommendation Accepted' : decision === 'modify' ? 'Modified Plan Filed' : 'Original Plan Retained'}
                        </strong>
                        <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '2px' }}>
                          Decision logged to immutable ledger · Timestamp: {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>

      {/* CHATBOT WIDGET */}
      <ChatWidget projects={projects} warnings={aiWarnings} />
    </div>
  );
}

function ChatWidget({ projects, warnings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am the GovSync AI Assistant. Ask me anything about current projects, conflicts, or schedules.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    // Mock intelligent response logic
    setTimeout(() => {
      let response = "I'm analyzing the current infrastructure data...";
      const query = userText.toLowerCase();

      if (query.includes('sector 7') || query.includes('overlap') || query.includes('conflict')) {
        const sectorProjects = projects.filter(p => p.location.toLowerCase().includes('sector 7') || p.location.toLowerCase().includes('sector 4'));
        if (sectorProjects.length > 0) {
          response = `I found ${sectorProjects.length} projects in that zone. The ${sectorProjects[0].dept} and ${sectorProjects[1]?.dept || 'another department'} have overlapping schedules. ${warnings.length > 0 ? 'A critical schedule conflict was detected.' : 'No critical alerts active yet.'} I recommend viewing the District Master Plan to sequence these.`;
        } else {
          response = "I did not find any immediate conflicts in Sector 7.";
        }
      } else if (query.includes('active') || query.includes('how many')) {
        const active = projects.filter(p => p.status !== 'Completed').length;
        response = `There are currently ${active} active government projects logged in the GovSync system across all departments.`;
      } else if (query.includes('budget') || query.includes('escrow')) {
        const total = projects.reduce((sum, p) => sum + (p.amount || 0), 0);
        response = `The total estimated budget for all registered active projects is approximately ₹${total} Cr. Funds are locked in smart escrow until milestones are cleared.`;
      } else {
        response = "Based on the cross-department data, everything seems to be proceeding according to the master plan. Would you like me to run a deep-dive analysis on a specific sector?";
      }

      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px',
          borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(99,102,241,0.4)', border: 'none', cursor: 'pointer',
          zIndex: 1000, display: isOpen ? 'none' : 'flex'
        }}
      >
        <MessageCircle size={30} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed', bottom: '30px', right: '30px', width: '380px', height: '550px',
              background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
              border: '1px solid var(--border)'
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Assistant</h3>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>GovSync Intelligence</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '12px 16px', borderRadius: '16px', fontSize: '0.95rem', lineHeight: '1.5',
                    background: msg.role === 'user' ? '#6366F1' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1E293B',
                    border: msg.role === 'ai' ? '1px solid #E2E8F0' : 'none',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'white', padding: '12px 16px', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#94A3B8', borderBottomLeftRadius: '4px' }}>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <Sparkles size={18} />
                    </motion.div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '16px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Ask about projects, conflicts..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.95rem', outline: 'none' }}
              />
              <button type="submit" disabled={!input.trim()} style={{
                background: input.trim() ? '#6366F1' : '#E2E8F0', color: 'white', border: 'none', borderRadius: '12px', width: '48px', height: '48px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
              }}>
                <Send size={20} style={{ marginLeft: '4px' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
