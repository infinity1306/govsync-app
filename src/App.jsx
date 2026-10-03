import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GovProvider } from './context/GovContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import DeptDashboard from './pages/DeptDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import AIAdvisor from './pages/AIAdvisor';
import Login from './pages/Login';
import EditorialLanding from './pages/EditorialLanding';
import Portals from './pages/Portals';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isEditorial = location.pathname === '/editorial';
  const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname === '/dashboard';
  const showNavAndFooter = !isLoginPage && !isEditorial && !isDashboardPage;

  return (
    <div className="app-container">
      {showNavAndFooter && <Navbar />}
      <main style={{ paddingTop: showNavAndFooter ? '80px' : '0' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Landing />
              </motion.div>
            } />
            <Route path="/editorial" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EditorialLanding />
              </motion.div>
            } />
            <Route path="/portals" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Portals />
              </motion.div>
            } />
            <Route path="/login" element={
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Login />
              </motion.div>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AdminDashboard />
                </motion.div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/dept/:deptId" element={
              <ProtectedRoute allowedRoles={['dept', 'admin']}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DeptDashboard />
                </motion.div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/finance" element={
              <ProtectedRoute allowedRoles={['finance', 'admin']}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FinanceDashboard />
                </motion.div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/contractor" element={
              <ProtectedRoute allowedRoles={['contractor', 'admin']}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ContractorDashboard />
                </motion.div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ai-advisor" element={
              <ProtectedRoute>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AIAdvisor />
                </motion.div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      {showNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GovProvider>
        <Router>
          <AppContent />
        </Router>
      </GovProvider>
    </ThemeProvider>
  );
}

export default App;
