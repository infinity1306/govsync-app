import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, HardHat, Droplet, Coins, FileText, Lock, ArrowRight, ShieldCheck, Zap, User as UserIcon, AlertTriangle, Network, Waves, Flame, Globe, Building2, Wifi, Leaf, Trees, TrafficCone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const departments = [
  { id: 'admin', label: 'Admin Portal', icon: Landmark, color: '#A78BFA' },
  { id: 'finance', label: 'Finance Dept', icon: Coins, color: '#FBBF24' },
  { id: 'contractor', label: 'Contractor', icon: FileText, color: '#4ADE80' },
  { id: 'pwd', label: 'PWD Dept', icon: HardHat, color: '#F59E0B' },
  { id: 'water', label: 'Water Dept', icon: Droplet, color: '#38BDF8' },
  { id: 'sewerage', label: 'Sewerage Dept', icon: Waves, color: '#7C3AED' },
  { id: 'drainage', label: 'Drainage Dept', icon: Waves, color: '#0891B2' },
  { id: 'electricity', label: 'Electricity Dept', icon: Zap, color: '#CA8A04' },
  { id: 'gas', label: 'Gas Pipeline', icon: Flame, color: '#DC2626' },
  { id: 'fiber', label: 'Optical Fiber', icon: Globe, color: '#2563EB' },
  { id: 'smartcity', label: 'Smart City', icon: Building2, color: '#7C3AED' },
  { id: 'telecom', label: 'Telecom Dept', icon: Wifi, color: '#9333EA' },
  { id: 'pollution', label: 'Pollution Control', icon: Leaf, color: '#16A34A' },
  { id: 'forest', label: 'Forest Dept', icon: Trees, color: '#15803D' },
  { id: 'traffic', label: 'Traffic Dept', icon: TrafficCone, color: '#EA580C' }
];

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState('admin');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Clear existing session when landing on the Access Hub to allow switching portals
  useEffect(() => {
    localStorage.removeItem('govsync_demo_profile');
    
    const checkAndClearSession = async () => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.signOut();
        }
      } catch (err) {
        // ignore errors on signout
      }
    };
    checkAndClearSession();
  }, []);

  const getRoleDetails = (deptId) => {
    if (deptId === 'admin') return { role: 'admin', dept_slug: null };
    if (deptId === 'finance') return { role: 'finance', dept_slug: null };
    if (deptId === 'contractor') return { role: 'contractor', dept_slug: null };
    return { role: 'dept', dept_slug: deptId };
  };

  const getRouteForRole = (roleId) => {
    if (roleId === 'admin') return '/dashboard/admin';
    if (roleId === 'finance') return '/dashboard/finance';
    if (roleId === 'contractor') return '/dashboard/contractor';
    return `/dashboard/dept/${roleId}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !passphrase) return;
    
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passphrase
      });

      // If invalid credentials, attempt signup (first login)
      if (error && error.message.includes('Invalid login credentials')) {
        const { role, dept_slug } = getRoleDetails(selected);
        const res = await supabase.auth.signUp({
          email,
          password: passphrase,
          options: {
            data: { role, dept_slug }
          }
        });
        data = res.data;
        error = res.error;
      }

      if (error) throw error;

      // Verify selected portal against actual profile
      const { role, dept_slug } = getRoleDetails(selected);
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, departments(slug)')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        const userRole = profile.role;
        const userDept = profile.departments?.slug;
        
        let isValid = false;
        if (userRole === 'admin' && role === 'admin') isValid = true;
        else if (userRole === 'finance' && role === 'finance') isValid = true;
        else if (userRole === 'contractor' && role === 'contractor') isValid = true;
        else if (userRole === 'dept' && role === 'dept' && userDept === dept_slug) isValid = true;

        if (!isValid) {
          await supabase.auth.signOut();
          setAuthError(`Access Denied: You are not authorized for the ${departments.find(d => d.id === selected).label} node.`);
          setIsAuthenticating(false);
          return;
        }
      }

      setAuthSuccess(true);
      setTimeout(() => {
        const from = location.state?.from?.pathname || getRouteForRole(selected);
        navigate(from, { replace: true });
      }, 800);
      
    } catch (error) {
      setAuthError(error.message);
      setIsAuthenticating(false);
    }
  };

  const handleDemoBypass = async (e) => {
    if (e) e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    
    // Unconditionally use local demo bypass
    console.warn("Using local demo bypass.");
    const { role, dept_slug } = getRoleDetails(selected);
    localStorage.setItem('govsync_demo_profile', JSON.stringify({
      role,
      departments: { slug: dept_slug }
    }));
    
    setAuthSuccess(true);
    setTimeout(() => {
      const from = location.state?.from?.pathname || getRouteForRole(selected);
      navigate(from, { replace: true });
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", sans-serif',
      backgroundColor: '#F8FAFC'
    }}>
      {/* Blurred Background Image */}
      <div style={{
        position: 'absolute',
        inset: '-10px',
        backgroundImage: 'url(/images/flyover_construction.png)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(3px) brightness(0.95)',
        zIndex: 0
      }} />

      {/* Whitish Translucent Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
        zIndex: 1
      }} />
      {/* Animated Soft Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            top: '-20%', left: '-10%',
            width: '70vw', height: '70vw',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            bottom: '-20%', right: '-10%',
            width: '60vw', height: '60vw',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}
        />
      </div>

      <AnimatePresence>
        {!authSuccess ? (
          <motion.div 
            className="premium-login-card"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              padding: '48px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '24px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.15)',
              zIndex: 10
            }}
          >
            {/* Header / Logo */}
            <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, type: "spring" }}
                style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: '16px',
                }}
              >
                <Network size={32} color="#818CF8" />
              </motion.div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#1E293B' }}>
                Gov<span style={{ color: '#6366F1' }}>Sync</span>
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '8px', letterSpacing: '0.02em' }}>
                Secure Infrastructure Coordination Node
              </p>
            </motion.div>

            <form onSubmit={handleLogin}>
              {/* Node Selection */}
              <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Select Operating Node
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '10px',
                  maxHeight: '225px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}>
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    const isActive = selected === dept.id;
                    return (
                      <motion.div
                        key={dept.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(dept.id)}
                        style={{
                          background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                          border: `1px solid ${isActive ? '#818CF8' : 'rgba(0, 0, 0, 0.05)'}`,
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Icon size={20} color={isActive ? '#6366F1' : '#64748B'} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? '#1E293B' : '#64748B', textAlign: 'center', lineHeight: '1.2' }}>
                          {dept.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: -16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden', marginBottom: '24px' }}
                  >
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} />
                      {authError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node Identifier (Email) */}
              <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Node Identifier (Email)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="operator@govsync.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px 14px 44px',
                      color: '#1E293B',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                  />
                </div>
              </motion.div>

              {/* Security Key */}
              <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Security Passphrase
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter node passphrase..."
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px 14px 44px',
                      color: '#1E293B',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isAuthenticating || !passphrase || !email}
                  whileHover={{ scale: (isAuthenticating || !passphrase || !email) ? 1 : 1.02 }}
                  whileTap={{ scale: (isAuthenticating || !passphrase || !email) ? 1 : 0.98 }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isAuthenticating 
                      ? '#4338CA' 
                      : ((passphrase && email) ? '#6366F1' : 'rgba(0,0,0,0.05)'),
                    color: (passphrase && email) ? 'white' : '#64748B',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: (isAuthenticating || !passphrase || !email) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isAuthenticating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                    />
                  ) : (
                    <>Establish Secure Uplink <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.div>

              {/* Google OAuth for Contractors */}
              <AnimatePresence>
                {selected === 'contractor' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: window.location.origin + '/dashboard/contractor'
                          }
                        });
                        if (error) setAuthError(error.message);
                      }}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                        color: '#1E293B',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <motion.div variants={itemVariants} style={{ marginTop: '24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Demo Access</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
              </div>
              <button
                type="button"
                onClick={handleDemoBypass}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  color: '#475569',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#1E293B'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
              >
                <ShieldCheck size={16} />
                Bypass Security for Demo
              </button>
            </motion.div>
            
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={14} /> AES-256 Encrypted Connection
            </div>
          </motion.div>
        ) : (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(24px)', padding: '64px', borderRadius: '24px', border: '1px solid rgba(138, 154, 134, 0.3)',
              boxShadow: '0 0 40px rgba(138, 154, 134, 0.1)'
            }}
          >
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, delay: 0.1 }}
              style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(138, 154, 134, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}
            >
              <ShieldCheck size={40} color="var(--highlight)" />
            </motion.div>
            <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Authentication Validated</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Routing to {departments.find(d => d.id === selected)?.label} Node...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
