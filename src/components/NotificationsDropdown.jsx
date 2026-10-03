import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useGovContext } from '../context/GovContext';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Force bypass to true so we extract notifications directly from the synced projects data
  // instead of requiring a separate 'notifications' table in Supabase.
  const isBypass = true;

  const { projects } = useGovContext();
  const [localReadStatus, setLocalReadStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('govsync_local_notifications_read');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const fetchNotifications = async (uid) => {
    if (isBypass) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setNotifications(data);
  };

  useEffect(() => {
    if (isBypass) {
      // Gather notifications from all projects
      const list = [];
      projects.forEach(p => {
        if (p.notifications) {
          p.notifications.forEach(n => {
            list.push({
              id: n.id,
              title: n.type === 'dept_notify' ? 'New Project Proposal' : n.type === 'response' ? 'Coordination Update' : 'Work Verification',
              body: n.message,
              created_at: n.timestamp,
              read: localReadStatus[n.id] ?? n.read ?? false,
              link: `/dashboard/admin`
            });
          });
        }
      });
      // Sort by timestamp descending
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(list.slice(0, 10));
      return;
    }

    // 1. Get current user
    const initAuth = async () => {
      let uid = 'demo-user';
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        uid = session.user.id;
      }
      setUserId(uid);
      fetchNotifications(uid);
    };

    initAuth();
  }, [projects, isBypass, localReadStatus]);

  useEffect(() => {
    if (isBypass || !userId) return;

    // 2. Subscribe to realtime notifications
    const channel = supabase.channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isBypass]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    if (unreadCount === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (isBypass) {
      const newStatus = { ...localReadStatus };
      notifications.forEach(n => {
        newStatus[n.id] = true;
      });
      setLocalReadStatus(newStatus);
      localStorage.setItem('govsync_local_notifications_read', JSON.stringify(newStatus));
      return;
    }

    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      if (isBypass) {
        const newStatus = { ...localReadStatus, [notif.id]: true };
        setLocalReadStatus(newStatus);
        localStorage.setItem('govsync_local_notifications_read', JSON.stringify(newStatus));
      } else {
        await supabase.from('notifications').update({ read: true }).eq('id', notif.id);
      }
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          borderRadius: '50%', transition: 'background 0.2s',
          backgroundColor: isOpen ? 'rgba(0,0,0,0.05)' : 'transparent'
        }}
      >
        <Bell size={20} color="#64748B" />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ 
              position: 'absolute', top: 4, right: 6, width: 10, height: 10, 
              background: '#EF4444', borderRadius: '50%', border: '2px solid white' 
            }}
          />
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px',
              background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
              border: '1px solid #E2E8F0', zIndex: 100, overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', margin: 0 }}>Notifications</h4>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8' }}>
                  <Bell size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>No new notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <Link 
                    key={notif.id} 
                    to={notif.link || '#'} 
                    onClick={() => handleNotificationClick(notif)}
                    style={{ 
                      display: 'block', padding: '16px 20px', borderBottom: '1px solid #F1F5F9',
                      textDecoration: 'none', background: notif.read ? 'white' : '#EEF2FF',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: notif.read ? '#F1F5F9' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        color: notif.read ? '#64748B' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Bell size={14} />
                      </div>
                      <div>
                        <h5 style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{notif.title}</h5>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>{notif.body}</p>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '6px', display: 'block' }}>
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div style={{ padding: '12px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '4px' }}>
                Close <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
