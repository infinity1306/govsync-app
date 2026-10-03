import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ProtectedRoute({ allowedRoles, children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = useRef(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // STEP 1: Check for local demo bypass FIRST and EXCLUSIVELY
    const demoProfileStr = localStorage.getItem('govsync_demo_profile');
    if (demoProfileStr) {
      isDemoMode.current = true;
      try {
        const parsed = JSON.parse(demoProfileStr);
        if (mounted) {
          setSession({ user: { id: 'demo-user', email: 'demo@govsync.in' } });
          setProfile(parsed);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to parse demo profile:', e);
        localStorage.removeItem('govsync_demo_profile');
        if (mounted) setLoading(false);
      }
      // Return with NO cleanup needed — we never subscribe to Supabase
      return;
    }

    // STEP 2: Only use Supabase if properly configured (not placeholder)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      // No demo profile and no real Supabase: not authenticated
      if (mounted) setLoading(false);
      return;
    }

    const fetchProfile = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, departments(slug)')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        if (mounted) setProfile(data);
      } catch (error) {
        console.warn('Profiles table not found, generating fallback profile:', error.message);
        // Fallback profile based on email/session
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const email = session.user.email || '';
            let role = 'admin';
            if (email.includes('contractor')) role = 'contractor';
            else if (email.includes('finance')) role = 'finance';
            else if (email.includes('dept') || email.includes('pwd')) role = 'dept';
            
            setProfile({
              id: userId,
              role: role,
              email: email,
              departments: role === 'dept' ? { slug: 'pwd' } : null
            });
          }
        } catch (sessionErr) {
          console.error('Session retrieval failed during fallback:', sessionErr);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // CRITICAL: Never let Supabase override demo mode
      if (isDemoMode.current) return;
      if (mounted) {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(74,64,54,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Verifying Clearance...</div>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Role mismatch, redirect to their proper dashboard
    let path = '/dashboard/admin';
    if (profile.role === 'dept') path = `/dashboard/dept/${profile.departments?.slug || 'pwd'}`;
    if (profile.role === 'finance') path = '/dashboard/finance';
    if (profile.role === 'contractor') path = '/dashboard/contractor';
    return <Navigate to={path} replace />;
  }

  return children ? children : <Outlet />;
}

