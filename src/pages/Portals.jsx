import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '../context/GovContext';
import { Landmark, HardHat, Droplet, Coins, FileText, Bot, ArrowRight, Zap, Wifi, Leaf, Waves, Flame, Globe, Building2, Trees, TrafficCone } from 'lucide-react';

const deptIcons = {
  water: Droplet,
  sewerage: Waves,
  drainage: Waves,
  electricity: Zap,
  gas: Flame,
  fiber: Globe,
  smartcity: Building2,
  telecom: Wifi,
  pollution: Leaf,
  forest: Trees,
  traffic: TrafficCone,
  municipality: Landmark
};

const defaultPortals = [
  { id: 'admin', label: 'District Administration', description: 'Central oversight, coordination hub, and workflow approvals.', icon: Landmark, color: '#A78BFA', role: 'admin', route: '/dashboard/admin' },
  { id: 'finance', label: 'Finance Department', description: 'Escrow ledgers, capital injection, and smart release of funds.', icon: Coins, color: '#FBBF24', role: 'finance', route: '/dashboard/finance' },
  { id: 'contractor', label: 'Contractor Portal', description: 'Assigned construction projects, milestone claims, and site logs.', icon: FileText, color: '#4ADE80', role: 'contractor', route: '/dashboard/contractor' },
  { id: 'ai-advisor', label: 'AI Conflict Engine', description: 'AI-powered conflict resolution, spatial warnings, and anomaly checks.', icon: Bot, color: '#EC4899', role: 'admin', route: '/dashboard/ai-advisor' },
];

const portals = [
  defaultPortals[0],
  ...DEPARTMENTS.map(d => ({
    id: d.id,
    label: `${d.name} Portal`,
    description: `Coordinate ${d.name} operations, submit budgets, and verify milestones.`,
    icon: deptIcons[d.id] || HardHat,
    color: d.color,
    role: 'dept',
    dept_slug: d.id,
    route: `/dashboard/dept/${d.id}`
  })),
  ...defaultPortals.slice(1)
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function Portals() {
  const navigate = useNavigate();

  const handlePortalClick = (portal) => {
    // Set demo profile for smooth access without logging in again
    localStorage.setItem('govsync_demo_profile', JSON.stringify({
      role: portal.role,
      departments: { slug: portal.dept_slug }
    }));
    window.location.href = portal.route;
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 24px',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            System <span style={{ color: 'var(--accent)' }}>Portals</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Access all dedicated department portals. Select a portal below to enter its specific dashboard and workflow.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.id}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                onClick={() => handlePortalClick(portal)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  transition: 'border-color 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = portal.color}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: `${portal.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Icon size={28} color={portal.color} />
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
                  {portal.label}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px', flexGrow: 1 }}>
                  {portal.description}
                </p>
                
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  color: portal.color, fontWeight: 600, fontSize: '0.9rem',
                  marginTop: 'auto'
                }}>
                  Access Portal <ArrowRight size={16} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
