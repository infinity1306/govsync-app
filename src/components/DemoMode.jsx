import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';
import { useGovContext } from '../context/GovContext';

export default function DemoMode() {
  const { createProject, submitDeptResponse, checkAndUnlockRoad, updateFundUtilization, updateDeptWorkProgress, submitCompletionVerification } = useGovContext();
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "AI Detects Pothole & Creates Project...",
    "Auto-Notifying Relevant Departments...",
    "Departments Submit Clearances...",
    "Water Dept Starts Pipeline Fix...",
    "Water Dept Finishes Pipeline Fix...",
    "Releasing Escrow Funds to Departments...",
    "AI Verifies Proof & Unlocks Road...",
    "Demo Complete! 🚀"
  ];

  const runDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStep(0);

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Step 1: Create Project
    await delay(1500);
    setStep(1);
    const newProject = createProject({
      name: 'AI Demo Pothole Repair',
      ward: 'Ward 8',
      lat: 23.24, lng: 77.42,
      complaintType: 'Pothole Repair',
      estimatedBudget: 80,
      priority: 'Critical',
      expectedTimeline: '1 Month',
      description: 'Auto-detected severe pothole hazard.'
    }, 'Citizen');

    // Step 2: Notify
    await delay(2000);
    setStep(2);

    // Step 3: Clearances (Traffic, Municipality)
    submitDeptResponse(newProject.id, 'traffic', 'completed', null);
    submitDeptResponse(newProject.id, 'municipality', 'yes', {
      workType: 'Debris Clearance', budget: 5, duration: '2 Days',
      startDate: '2026-08-01', completionDate: '2026-08-02', excavation: false, remarks: 'Clear rubble'
    });
    await delay(2000);
    setStep(3);

    // Step 4: Work starts
    updateDeptWorkProgress(newProject.id, 'municipality', 50);
    await delay(1500);
    setStep(4);

    // Step 5: Work finishes
    updateDeptWorkProgress(newProject.id, 'municipality', 100);
    await delay(1500);
    setStep(5);

    // Step 6: Funds
    updateFundUtilization(newProject.id, 'municipality', { used: 5 });
    await delay(1500);
    setStep(6);

    // Step 7: Verify
    submitCompletionVerification(newProject.id, 'municipality', { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true });
    checkAndUnlockRoad(newProject.id);
    await delay(2000);
    setStep(7);

    // Done
    await delay(3000);
    setIsRunning(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {!isRunning ? (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runDemo}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white', border: 'none', padding: '12px 24px', borderRadius: '100px',
            display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', cursor: 'pointer'
          }}
        >
          <Play fill="white" size={16} /> 
          Run AI Presentation Demo
        </motion.button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white', border: '1px solid var(--border)', borderRadius: '16px',
            padding: '16px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: 320
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {step < steps.length - 1 ? (
              <Loader2 className="spinner" size={20} color="#6366F1" />
            ) : (
              <CheckCircle2 size={24} color="#10B981" />
            )}
            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
              {step < steps.length - 1 ? 'Simulating 6 Months...' : 'Demo Complete!'}
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 700, color: '#6366F1', marginBottom: 4 }}>Current Action:</div>
            {steps[step]}
          </div>

          <div style={{ marginTop: 16, height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              style={{ height: '100%', background: '#6366F1' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
