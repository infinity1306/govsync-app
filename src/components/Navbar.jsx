import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Menu, X, ChevronDown, User, Activity, ShieldCheck, Zap, FolderKanban, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e, path) => {
    if (path.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      window.history.pushState(null, '', path);
    } else if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'The Problem', path: '/#problem' },
    { name: 'Workflow', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
    { name: 'AI Engine', path: '/#ai-demo' },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(15, 23, 42, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: scrolled ? '12px 0' : '20px 0',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
            }}>
              <Network size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              GovSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ gap: '32px', alignItems: 'center' }} className="desktop-nav">
            <div style={{ display: 'flex', gap: '8px', background: scrolled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {navLinks.map((link) => (
                <div 
                  key={link.name}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ position: 'relative' }}
                >
                  <Link 
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link.path)}
                    style={{
                      display: 'block',
                      padding: '8px 20px',
                      color: location.pathname === link.path ? 'white' : '#94A3B8',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      position: 'relative',
                      zIndex: 2,
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.name}
                  </Link>
                  {hoveredLink === link.name && (
                    <motion.div
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '100px',
                        zIndex: 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div style={{ alignItems: 'center', gap: '16px' }} className="desktop-nav">
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#CBD5E1', borderRadius: '50%', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s ease', padding: 0
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#CBD5E1'; }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '100px',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(99, 102, 241, 0.39)'; }}
            >
              <User size={16} /> Access Hub
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setIsOpen(true)}
            style={{
              display: 'flex',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <Menu size={28} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', padding: '8px', borderRadius: '12px' }}>
                  <Network size={20} color="white" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>GovSync</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    to={link.path}
                    onClick={(e) => {
                      setIsOpen(false);
                      handleNavClick(e, link.path);
                    }}
                    style={{
                      color: 'white', fontSize: '1.5rem', fontWeight: 700, textDecoration: 'none', display: 'block'
                    }}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#CBD5E1', fontSize: '1.2rem', fontWeight: 600, textDecoration: 'none', marginBottom: '24px' }}>
                  <LayoutDashboard size={20} /> Department Portals
                </Link>
                <Link to="/login" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', padding: '16px', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 700, textDecoration: 'none' }}>
                  <User size={20} /> Access GovSync Hub
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .mobile-toggle-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
        }
      `}} />
    </>
  );
}
