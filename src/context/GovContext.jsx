import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const GovContext = createContext();

// ─── 12 DEPARTMENTS ─────────────────────────────────────────────────
export const DEPARTMENTS = [
  { id: 'water', name: 'Water Supply', color: '#0284C7', bg: '#E0F2FE', icon: '💧' },
  { id: 'sewerage', name: 'Sewerage', color: '#7C3AED', bg: '#EDE9FE', icon: '🚰' },
  { id: 'drainage', name: 'Drainage', color: '#0891B2', bg: '#CFFAFE', icon: '🌊' },
  { id: 'electricity', name: 'Electricity', color: '#CA8A04', bg: '#FEF9C3', icon: '⚡' },
  { id: 'gas', name: 'Gas Pipeline', color: '#DC2626', bg: '#FEE2E2', icon: '🔥' },
  { id: 'fiber', name: 'Optical Fiber / Internet', color: '#2563EB', bg: '#DBEAFE', icon: '🌐' },
  { id: 'smartcity', name: 'Smart City', color: '#7C3AED', bg: '#F3E8FF', icon: '🏙️' },
  { id: 'telecom', name: 'Telecom', color: '#9333EA', bg: '#FAE8FF', icon: '📡' },
  { id: 'pollution', name: 'Pollution Control', color: '#16A34A', bg: '#DCFCE7', icon: '🌿' },
  { id: 'forest', name: 'Forest Department', color: '#15803D', bg: '#D1FAE5', icon: '🌳' },
  { id: 'traffic', name: 'Traffic Department', color: '#EA580C', bg: '#FFEDD5', icon: '🚦' },
  { id: 'municipality', name: 'Municipality', color: '#B45309', bg: '#FEF3C7', icon: '🏛️' },
];

export const getDeptById = (id) => DEPARTMENTS.find(d => d.id === id);

// ─── PROJECT TYPES ──────────────────────────────────────────────────
export const PROJECT_TYPES = [
  { id: 'road', name: 'Road', icon: '🛣️' },
  { id: 'highway', name: 'Highway', icon: '🛤️' },
  { id: 'bridge', name: 'Bridge', icon: '🌉' },
  { id: 'water_pipeline', name: 'Water Pipeline', icon: '💧' },
  { id: 'sewer', name: 'Sewer', icon: '🚰' },
  { id: 'drainage', name: 'Drainage', icon: '🌊' },
  { id: 'electricity', name: 'Electricity', icon: '⚡' },
  { id: 'gas_pipeline', name: 'Gas Pipeline', icon: '🔥' },
  { id: 'telecom_fiber', name: 'Telecom Fiber', icon: '🌐' },
  { id: 'smart_city', name: 'Smart City', icon: '🏙️' },
  { id: 'metro', name: 'Metro', icon: '🚇' },
  { id: 'footpath', name: 'Footpath', icon: '🚶' },
  { id: 'street_lighting', name: 'Street Lighting', icon: '💡' },
  { id: 'flyover', name: 'Flyover', icon: '🏗️' },
  { id: 'underpass', name: 'Underpass', icon: '🚧' },
];

// ─── AI COORDINATION WORKFLOW STATUSES ──────────────────────────────
export const COORDINATION_STAGES = [
  { id: 'project_created', label: 'Need Identified', icon: '📋' },
  { id: 'departments_notified', label: 'Survey & Feasibility Study', icon: '📨' },
  { id: 'responses_received', label: 'Detailed Project Report (DPR)', icon: '✅' },
  { id: 'ai_analyzing', label: 'Administrative Approval', icon: '🤖' },
  { id: 'comparison_ready', label: 'Budget/Fund Sanction', icon: '⚖️' },
  { id: 'admin_review', label: 'Technical Approval', icon: '👔' },
  { id: 'funds_optimized', label: 'Tender Published', icon: '💰' },
  { id: 'budget_integrated', label: 'Contractors Submit Bids', icon: '📊' },
  { id: 'tender_recommended', label: 'Bid Evaluation', icon: '📑' },
  { id: 'tender_approved', label: 'Tender Awarded', icon: '✅' },
  { id: 'executing', label: 'Work Order Issued', icon: '🏗️' },
  { id: 'ai_monitoring', label: 'Construction Starts', icon: '📡' },
  { id: 'completed', label: 'Funds Released in Stages (Milestone-based)', icon: '🎉' },
];

// ─── AI PREDICTION ENGINE (Deterministic Simulation) ────────────────
const AI_EVIDENCE_LIBRARY = {
  water: [
    'Population growth rate 3.2% in this ward',
    'Current pipeline installed in 2014 (12 years old)',
    'Water demand increased 18% over last 3 years',
    'New housing projects approved: 3 complexes (1,200 units)',
    '14 water leakage complaints in last 6 months',
    'Municipal master plan mandates pipeline upgrade by 2028',
  ],
  sewerage: [
    'Sewer capacity at 78% utilization',
    'Monsoon overflow incidents: 4 in last 2 years',
    'Smart City plan mandates underground sewerage network',
    'Building permits issued: 8 new constructions in area',
    'Historical maintenance backlog: 22 months overdue',
  ],
  drainage: [
    'Flood risk score: 7.2/10 for this zone',
    'Annual rainfall increased 12% over 5 years',
    'Existing drains built in 2011 — capacity insufficient',
    'Urban runoff coefficient elevated due to new constructions',
    'NDMA recommends drain upgrade for Zone-C areas',
  ],
  electricity: [
    'Load demand grew 24% in last 2 years',
    'Cable age: 15 years (replacement threshold: 18 years)',
    'Smart meter penetration: only 32% in this area',
    'Industrial zone expansion planned within 1.5 km',
    'Street lighting upgrade pending since 2024',
  ],
  gas: [
    'Gas pipeline last surveyed in 2022',
    'No residential gas connections in 500m radius',
    'Smart City gas grid phase-2 planned for this zone',
    'Safety audit due in 8 months',
  ],
  fiber: [
    'Internet penetration: 62% (city avg 78%)',
    'School and hospital located within 800m',
    'BharatNet Phase-3 scheduled for this corridor',
    'Fiber duct conduit can be laid during current excavation',
    '5G tower installations planned within 2 years',
  ],
  smartcity: [
    'Smart City Mission includes this ward in Phase-2',
    'IoT sensor deployment planned for 2027',
    'Smart traffic management system approved',
    'CCTV surveillance network expansion underway',
  ],
  telecom: [
    'Mobile tower density below TRAI recommendation',
    'Telecom duct sharing agreement available',
    'Underground cable route overlaps with project area',
  ],
  pollution: [
    'Air quality index averaging 182 (unhealthy)',
    'Construction dust monitoring required by CPCB',
    'Green belt development mandate within 1 km',
  ],
  forest: [
    '8 mature trees in project alignment',
    'Tree transplantation order may be required',
    'Compensatory afforestation fund applicable',
  ],
  traffic: [
    'Daily traffic volume: 14,200 vehicles',
    'Accident hotspot: 6 incidents in 12 months',
    'Signal timing optimization recommended',
    'Pedestrian crossing demand: High',
    'Traffic diversion plan mandatory during construction',
  ],
  municipality: [
    'Ward development fund allocation pending',
    'Citizen complaints in this area: 34 in 6 months',
    'Footpath and utility corridor maintenance due',
    'Property tax collection area — minimize disruption',
  ],
};

const generateAIPrediction = (deptId, project, deptResponse) => {
  // Deterministic "AI" analysis based on project attributes
  const seed = (project.id + deptId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (n) => ((seed * 9301 + 49297) % 233280) / 233280 * n;

  const evidencePool = AI_EVIDENCE_LIBRARY[deptId] || [];
  const evidenceCount = Math.min(evidencePool.length, 3 + Math.floor(rand(3)));
  const evidence = evidencePool.slice(0, evidenceCount);

  // AI may disagree with department
  const deptSaidNo = !deptResponse || deptResponse.currentWork === 'no';
  const shouldDisagree = deptSaidNo && (seed % 3 !== 0); // ~66% chance AI disagrees when dept says no
  const confidence = shouldDisagree
    ? Math.floor(72 + rand(26))  // 72-98%
    : Math.floor(55 + rand(35)); // 55-90%

  const futureTimelines = ['6 months', '12 months', '18 months', '24 months', '36 months'];
  const timelineIdx = Math.floor(rand(futureTimelines.length));

  const dept = getDeptById(deptId);
  const baseBudget = project.estimatedBudget * (0.08 + rand(0.25));
  const aiBudget = Math.round(baseBudget * 10) / 10;
  const deptBudget = deptResponse?.budget || Math.round(aiBudget * (1.05 + rand(0.15)) * 10) / 10;

  const riskFactors = ['Timeline Overlap', 'Budget Overrun', 'Utility Conflict', 'Environmental Impact', 'Traffic Disruption', 'Weather Dependency'];
  const riskScore = Math.round(3 + rand(7));

  const recommendations = [
    `Install ${dept?.name} infrastructure during current excavation to avoid future re-digging`,
    `Coordinate with Road Department for shared excavation window`,
    `Pre-lay conduits/ducts for ${dept?.name} even if work is deferred`,
    `Schedule ${dept?.name} work before road surface is laid`,
  ];

  return {
    predictsFutureWork: shouldDisagree || (!deptSaidNo),
    confidence,
    timeframe: futureTimelines[timelineIdx],
    aiBudgetEstimate: aiBudget,
    deptBudgetEstimate: deptBudget,
    budgetDifference: Math.round((deptBudget - aiBudget) * 10) / 10,
    evidence,
    riskScore,
    riskFactors: riskFactors.slice(0, 2 + Math.floor(rand(3))),
    recommendation: recommendations[Math.floor(rand(recommendations.length))],
    environmentalImpact: riskScore > 6 ? 'Moderate' : 'Low',
    expectedSavings: Math.round(rand(15) + 5),
    historicalDataPoints: Math.floor(12 + rand(30)),
    populationForecast: `+${(2.1 + rand(3.5)).toFixed(1)}% annual growth`,
    trafficForecast: `+${Math.floor(800 + rand(4000))} vehicles/day by ${2027 + Math.floor(rand(3))}`,
    disagreesWithDept: shouldDisagree && deptSaidNo,
    disagreementReason: shouldDisagree && deptSaidNo
      ? `AI analysis indicates ${dept?.name} infrastructure will be required within ${futureTimelines[timelineIdx]} based on population growth, demand forecasts, and infrastructure age analysis.`
      : null,
  };
};

// ─── SEED AI COORDINATION DATA FOR PRJ-2026-001 ────────────────────
const SEED_COORDINATION_001 = {
  status: 'comparison_ready',
  initiatedAt: '2026-06-15T10:00:00',
  workflowTimeline: [
    { stage: 'project_created', timestamp: '2026-06-15T10:00:00', note: 'Project created by Road Department' },
    { stage: 'departments_notified', timestamp: '2026-06-15T10:01:00', note: 'AI auto-notified 10 relevant departments' },
    { stage: 'responses_received', timestamp: '2026-06-20T16:00:00', note: '9 of 10 departments responded' },
    { stage: 'ai_analyzing', timestamp: '2026-06-20T16:01:00', note: 'AI validation engine started analysis' },
    { stage: 'comparison_ready', timestamp: '2026-06-20T16:05:00', note: 'Department vs AI comparison ready for admin review' },
  ],
  departmentResponses: {
    water: {
      respondedAt: '2026-06-16T14:30:00',
      currentWork: 'yes',
      futureWork: 'yes',
      futureWorkYears: 1,
      details: {
        projectName: 'Pipeline Replacement – Sector 7',
        estimatedCost: 42,
        estimatedDuration: '18 Days',
        priority: 'High',
        utilityType: 'Water Main (300mm)',
        requiredExcavation: true,
        expectedStart: '2026-07-01',
        expectedCompletion: '2026-07-18',
        reason: 'Old pipeline corroded, full replacement needed. Current pipeline at 82% capacity.',
        supportingDocs: ['Pipeline Inspection Report 2026.pdf', 'Corrosion Analysis.pdf'],
        gisLayer: 'Water_Network_Layer_v3',
      },
    },
    sewerage: {
      respondedAt: '2026-06-17T09:00:00',
      currentWork: 'no',
      futureWork: 'no',
      noReason: 'work_completed',
      noExplanation: 'Sewer upgrade completed in March 2026.',
    },
    drainage: {
      respondedAt: '2026-06-17T11:00:00',
      currentWork: 'yes',
      futureWork: 'no',
      details: {
        projectName: 'Storm Drain Upgrade – Sector 7',
        estimatedCost: 25,
        estimatedDuration: '12 Days',
        priority: 'High',
        utilityType: 'Storm Drain (600mm)',
        requiredExcavation: true,
        expectedStart: '2026-07-05',
        expectedCompletion: '2026-07-16',
        reason: 'Existing drain capacity insufficient for monsoon runoff.',
        supportingDocs: ['Drainage Capacity Study.pdf'],
        gisLayer: 'Drainage_Network_v2',
      },
    },
    electricity: {
      respondedAt: '2026-06-16T16:00:00',
      currentWork: 'no',
      futureWork: 'yes',
      futureWorkYears: 2,
      noReason: 'work_completed',
      noExplanation: 'Cable laying completed last month.',
      details: {
        projectName: 'Smart Meter Upgrade – Sector 7',
        estimatedCost: 18,
        estimatedDuration: '10 Days',
        priority: 'Medium',
        utilityType: 'LT Cable + Smart Meters',
        requiredExcavation: false,
        expectedStart: '2027-03-01',
        expectedCompletion: '2027-03-10',
        reason: 'Phase-2 smart meter rollout scheduled for 2027.',
        supportingDocs: ['Smart Grid Rollout Plan.pdf'],
        gisLayer: 'Electricity_Grid_v4',
      },
    },
    gas: {
      respondedAt: null,
      currentWork: null,
      futureWork: null,
    },
    fiber: {
      respondedAt: '2026-06-18T10:00:00',
      currentWork: 'no',
      futureWork: 'no',
      noReason: 'work_completed',
      noExplanation: 'Fiber laid 4 months ago.',
    },
    smartcity: {
      respondedAt: '2026-06-19T09:00:00',
      currentWork: 'no',
      futureWork: 'yes',
      futureWorkYears: 3,
      noReason: 'no_infrastructure_required',
      details: {
        projectName: 'IoT Sensor Network – Ward 12',
        estimatedCost: 12,
        estimatedDuration: '15 Days',
        priority: 'Low',
        utilityType: 'IoT Sensors + Edge Gateway',
        requiredExcavation: false,
        expectedStart: '2028-01-15',
        expectedCompletion: '2028-01-30',
        reason: 'Smart City Phase-2 IoT deployment.',
        supportingDocs: ['Smart City Master Plan v2.pdf'],
        gisLayer: 'SmartCity_IoT_Layer',
      },
    },
    telecom: {
      respondedAt: '2026-06-18T14:00:00',
      currentWork: 'no',
      futureWork: 'no',
      noReason: 'work_completed',
      noExplanation: 'Underground cable duct already in place.',
    },
    pollution: {
      respondedAt: '2026-06-19T11:00:00',
      currentWork: 'no',
      futureWork: 'no',
      noReason: 'no_infrastructure_required',
    },
    forest: {
      respondedAt: '2026-06-19T14:00:00',
      currentWork: 'no',
      futureWork: 'no',
      noReason: 'no_infrastructure_required',
    },
    traffic: {
      respondedAt: '2026-06-17T16:00:00',
      currentWork: 'yes',
      futureWork: 'no',
      details: {
        projectName: 'Traffic Signal Installation',
        estimatedCost: 8,
        estimatedDuration: '5 Days',
        priority: 'Medium',
        utilityType: 'Traffic Signals',
        requiredExcavation: false,
        expectedStart: '2026-07-20',
        expectedCompletion: '2026-07-24',
        reason: 'New traffic signals at 3 intersections for safety.',
        supportingDocs: ['Traffic Impact Assessment.pdf'],
        gisLayer: 'Traffic_Signal_Layer',
      },
    },
    municipality: {
      respondedAt: '2026-06-18T09:00:00',
      currentWork: 'no',
      futureWork: 'no',
      noReason: 'work_completed',
      noExplanation: 'Footpath repair completed in May 2026.',
    },
  },
  aiPredictions: {}, // Will be auto-generated
  adminDecisions: {},
  integratedSummary: null,
  aiRecommendation: null,
  fundOptimization: null,
  tenderRecommendation: null,
  decisionLog: [
    { timestamp: '2026-06-15T10:00:00', action: 'Project Created', actor: 'Road Department', notes: 'Auto-triggered AI coordination workflow.' },
    { timestamp: '2026-06-15T10:01:00', action: 'Departments Notified', actor: 'AI System', notes: '10 departments auto-notified based on project type analysis.' },
  ],
};

// ─── DASHBOARD METRICS (PHASE 1) ────────────────────────────────────
export const DASHBOARD_METRICS = {
  nationalStats: {
    projectsCompleted: 1420,
    moneySaved: '₹34.5 Cr',
    reExcavationsPrevented: 89,
    avgApprovalTime: '4 Days (Down from 45)',
    infrastructureRiskReduction: '76%',
    citizenSatisfaction: '92%',
  },
  sustainability: {
    co2Saved: '12,400 kg',
    treesProtected: 340,
    waterConserved: '4.2M Liters'
  },
  departmentPerformance: [
    { name: 'Water Supply', score: 94, responseTime: '12h' },
    { name: 'Electricity', score: 89, responseTime: '18h' },
    { name: 'Gas Pipeline', score: 85, responseTime: '24h' },
    { name: 'Traffic', score: 98, responseTime: '4h' },
  ]
};

// ─── SEED DATA ──────────────────────────────────────────────────────
const SEED_PROJECTS = [
  {
    id: 'PRJ-2026-001',
    name: 'Road Construction – Sector 7 Main Arterial',
    ward: 'Ward 12',
    gpsLocation: { lat: 23.2599, lng: 77.4126 },
    complaintType: 'Road Construction',
    estimatedBudget: 200, // in Lakhs (₹2 Crore)
    priority: 'Critical',
    expectedTimeline: 'Aug 2026 – Dec 2026',
    description: 'Complete road reconstruction with asphalt overlay on Sector 7 main arterial road.',
    status: 'dept_coordination',
    createdAt: '2026-06-15',
    departmentStatuses: {
      water: 'yes', sewerage: 'completed', drainage: 'yes',
      electricity: 'completed', gas: 'pending', fiber: 'completed',
      smartcity: 'not_applicable', telecom: 'completed', pollution: 'not_applicable',
      forest: 'not_applicable', traffic: 'yes', municipality: 'completed',
    },
    departmentWork: {
      water: { workType: 'Pipeline Replacement', budget: 42, duration: '18 Days', startDate: '2026-07-01', completionDate: '2026-07-18', excavation: true, remarks: 'Old pipeline corroded, full replacement needed', progress: 35 },
      drainage: { workType: 'Storm Drain Upgrade', budget: 25, duration: '12 Days', startDate: '2026-07-05', completionDate: '2026-07-16', excavation: true, remarks: 'Existing drain capacity insufficient', progress: 0 },
      traffic: { workType: 'Signal Installation', budget: 8, duration: '5 Days', startDate: '2026-07-20', completionDate: '2026-07-24', excavation: false, remarks: 'New traffic signals at 3 intersections', progress: 0 },
    },
    discussions: [
      { id: 'msg-1', sender: 'Admin', text: 'Please prioritize the Sector 7 pipeline replacement.', timestamp: '2026-06-16T10:00:00' },
      { id: 'msg-2', sender: 'Water Supply', text: '@Electricity Will you need to relocate cables during our excavation?', timestamp: '2026-06-16T11:30:00' },
      { id: 'msg-3', sender: 'Electricity', text: 'Yes, our team will coordinate with yours next week.', timestamp: '2026-06-16T14:15:00' }
    ],
    fundAllocations: {
      water: 42, sewerage: 0, drainage: 25, electricity: 0, gas: 0, fiber: 0,
      smartcity: 0, telecom: 0, pollution: 0, forest: 0, traffic: 8, municipality: 0,
      road: 125,
    },
    fundUtilization: {
      water: { used: 14.7, invoices: 2, photos: 3 },
      drainage: { used: 0, invoices: 0, photos: 0 },
      traffic: { used: 0, invoices: 0, photos: 0 },
    },
    completionVerification: {
      sewerage: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      electricity: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      fiber: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      telecom: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      municipality: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
    },
    roadConstructionUnlocked: false,
    roadDepartment: null,
    additionalFundRequests: [],
    notifications: [
      { id: 'n1', type: 'dept_notify', message: 'Road construction planned in Ward 12. All departments notified.', timestamp: '2026-06-15T10:00:00', read: true },
      { id: 'n2', type: 'response', dept: 'water', message: 'Water Supply: Pipeline Replacement required (₹42L, 18 days)', timestamp: '2026-06-16T14:30:00', read: true },
      { id: 'n3', type: 'completion', dept: 'electricity', message: 'Electricity work completed and verified.', timestamp: '2026-07-01T09:15:00', read: false },
    ],
    aiCoordination: SEED_COORDINATION_001,
  },
  {
    id: 'PRJ-2026-002',
    name: 'Road Widening – NH-12 Bypass Junction',
    ward: 'Ward 5',
    gpsLocation: { lat: 23.2750, lng: 77.4300 },
    complaintType: 'Road Widening',
    estimatedBudget: 350,
    priority: 'High',
    expectedTimeline: 'Sep 2026 – Mar 2027',
    description: 'Widen NH-12 bypass junction from 2-lane to 4-lane with central divider.',
    status: 'road_approved',
    createdAt: '2026-05-10',
    departmentStatuses: {
      water: 'completed', sewerage: 'completed', drainage: 'completed',
      electricity: 'completed', gas: 'completed', fiber: 'completed',
      smartcity: 'not_applicable', telecom: 'completed', pollution: 'not_applicable',
      forest: 'completed', traffic: 'completed', municipality: 'completed',
    },
    departmentWork: {
      water: { workType: 'Main Line Diversion', budget: 38, duration: '15 Days', startDate: '2026-06-01', completionDate: '2026-06-15', excavation: true, remarks: 'Divert main supply line for widening', progress: 100 },
      gas: { workType: 'Pipeline Relocation', budget: 22, duration: '10 Days', startDate: '2026-06-10', completionDate: '2026-06-19', excavation: true, remarks: 'Relocate gas pipeline 3m westward', progress: 100 },
      forest: { workType: 'Tree Transplantation', budget: 12, duration: '8 Days', startDate: '2026-06-05', completionDate: '2026-06-12', excavation: false, remarks: '14 trees to be transplanted', progress: 100 },
    },
    discussions: [],
    fundAllocations: {
      water: 38, sewerage: 0, drainage: 18, electricity: 15, gas: 22, fiber: 10,
      smartcity: 0, telecom: 5, pollution: 0, forest: 12, traffic: 10, municipality: 0,
      road: 220,
    },
    fundUtilization: {
      water: { used: 38, invoices: 4, photos: 8 },
      gas: { used: 22, invoices: 3, photos: 6 },
      forest: { used: 12, invoices: 2, photos: 5 },
    },
    completionVerification: {
      water: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      sewerage: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      drainage: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      electricity: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      gas: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      fiber: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      telecom: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      forest: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      traffic: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
      municipality: { geoPhotos: true, beforeAfter: true, certificate: true, engineerApproval: true, verified: true },
    },
    roadConstructionUnlocked: true,
    roadDepartment: {
      contractor: 'L&T Infra',
      approvedBudget: 220,
      releasedBudget: 220,
      usedBudget: 189,
      progress: 65,
      milestone: 'Base Layer Completed',
      dprUploaded: true,
      droneImages: 4,
      progressPhotos: 12,
    },
    additionalFundRequests: [
      {
        id: 'AFR-001',
        originalBudget: 220,
        usedBudget: 189,
        additionalRequired: 18,
        reason: 'Unexpected underground cable duct discovered during excavation. Requires rerouting.',
        stages: { road: 'approved', commissioner: 'approved', finance: 'pending', government: 'pending' },
        status: 'under_review',
        createdAt: '2026-07-08',
      }
    ],
    notifications: [],
  },
  {
    id: 'PRJ-2026-003',
    name: 'Pothole Repair – MG Road Stretch',
    ward: 'Ward 3',
    gpsLocation: { lat: 23.2450, lng: 77.4050 },
    complaintType: 'Pothole Repair',
    estimatedBudget: 45,
    priority: 'Medium',
    expectedTimeline: 'Jul 2026 – Aug 2026',
    description: 'Repair severe potholes on MG Road 2km stretch near central market.',
    status: 'dept_notification',
    createdAt: '2026-07-08',
    departmentStatuses: {
      water: 'not_applicable', sewerage: 'not_applicable', drainage: 'not_applicable',
      electricity: 'not_applicable', gas: 'not_applicable', fiber: 'not_applicable',
      smartcity: 'not_applicable', telecom: 'not_applicable', pollution: 'not_applicable',
      forest: 'not_applicable', traffic: 'pending', municipality: 'pending',
    },
    departmentWork: {},
    discussions: [],
    fundAllocations: {},
    fundUtilization: {},
    completionVerification: {},
    roadConstructionUnlocked: false,
    roadDepartment: null,
    additionalFundRequests: [],
    notifications: [
      { id: 'n4', type: 'dept_notify', message: 'Pothole repair planned on MG Road. All departments notified.', timestamp: '2026-07-08T11:00:00', read: false },
    ],
  },
];

// ─── AI RECOMMENDATIONS ENGINE ──────────────────────────────────────
const generateAIInsights = (projects) => {
  const insights = [];

  // Check for duplicate/overlapping work
  const locations = {};
  projects.forEach(p => {
    const key = p.ward;
    if (!locations[key]) locations[key] = [];
    locations[key].push(p);
  });
  Object.entries(locations).forEach(([ward, projs]) => {
    if (projs.length > 1) {
      insights.push({
        id: `ai-overlap-${ward}`,
        type: 'warning',
        severity: 'high',
        title: 'Overlapping Projects Detected',
        message: `${projs.length} projects planned in ${ward}. Consider consolidating to avoid repeated excavation.`,
        projects: projs.map(p => p.id),
        recommendation: 'Merge timelines and coordinate all department work before any excavation begins.',
      });
    }
  });

  // Check for departments with recent excavation
  projects.forEach(p => {
    if (p.departmentWork) {
      Object.entries(p.departmentWork).forEach(([deptId, work]) => {
        if (work.excavation && work.progress === 100) {
          const dept = getDeptById(deptId);
          insights.push({
            id: `ai-redig-${p.id}-${deptId}`,
            type: 'caution',
            severity: 'medium',
            title: 'Avoid Re-Digging',
            message: `${dept?.name || deptId} completed excavation work in ${p.ward}. Coordinate with Road Department to avoid re-digging.`,
            projects: [p.id],
            recommendation: `Delay road construction until all underground work in ${p.ward} is verified complete.`,
          });
        }
      });
    }
  });

  // Check for excessive fund requests
  projects.forEach(p => {
    if (p.additionalFundRequests?.length > 0) {
      const totalAdditional = p.additionalFundRequests.reduce((s, r) => s + r.additionalRequired, 0);
      const originalRoad = p.fundAllocations?.road || p.estimatedBudget;
      if (totalAdditional > originalRoad * 0.15) {
        insights.push({
          id: `ai-budget-${p.id}`,
          type: 'alert',
          severity: 'high',
          title: 'Budget Anomaly Detected',
          message: `Additional fund requests for "${p.name}" exceed 15% of original road budget. Total additional: ₹${totalAdditional}L vs original ₹${originalRoad}L.`,
          projects: [p.id],
          recommendation: 'Trigger financial audit and review DPR accuracy before releasing additional funds.',
        });
      }
    }
  });

  // Check for delays
  projects.forEach(p => {
    if (p.departmentWork) {
      Object.entries(p.departmentWork).forEach(([deptId, work]) => {
        if (work.progress > 0 && work.progress < 100) {
          const dept = getDeptById(deptId);
          const completionDate = new Date(work.completionDate);
          const today = new Date();
          if (today > completionDate) {
            const delayDays = Math.ceil((today - completionDate) / (1000 * 60 * 60 * 24));
            insights.push({
              id: `ai-delay-${p.id}-${deptId}`,
              type: 'warning',
              severity: 'medium',
              title: 'Department Work Delayed',
              message: `${dept?.name || deptId} work on "${p.name}" is ${delayDays} days overdue. Expected completion: ${work.completionDate}.`,
              projects: [p.id],
              recommendation: `Escalate to ${dept?.name} head and adjust project timeline accordingly.`,
            });
          }
        }
      });
    }
  });

  // Gas department upcoming work advisory
  projects.forEach(p => {
    if (p.departmentStatuses?.gas === 'pending' && p.status === 'dept_notification') {
      insights.push({
        id: `ai-gas-advisory-${p.id}`,
        type: 'info',
        severity: 'low',
        title: 'Gas Department Advisory',
        message: `Gas Department plans routine maintenance within 4 months in ${p.ward}. Consider delaying road construction until gas work is scheduled.`,
        projects: [p.id],
        recommendation: 'Request Gas Department to confirm maintenance timeline before road construction scheduling.',
      });
    }
  });

  return insights;
};

// ─── HELPER: Check if road can be unlocked ──────────────────────────
const canUnlockRoad = (project) => {
  if (!project.departmentStatuses) return false;
  return DEPARTMENTS.every(dept => {
    const status = project.departmentStatuses[dept.id];
    return status === 'completed' || status === 'no' || status === 'not_applicable';
  });
};

// ─── HELPER: Calculate project stats ────────────────────────────────
const getProjectStats = (projects) => {
  const active = projects.filter(p => p.status !== 'completed');
  const awaitingResponses = projects.filter(p => p.status === 'dept_notification' || p.status === 'dept_coordination');
  const pendingDeptWork = projects.reduce((count, p) => {
    if (!p.departmentStatuses) return count;
    return count + Object.values(p.departmentStatuses).filter(s => s === 'yes' || s === 'pending').length;
  }, 0);
  const totalAllocated = projects.reduce((sum, p) => {
    if (!p.fundAllocations) return sum;
    return sum + Object.values(p.fundAllocations).reduce((s, v) => s + (v || 0), 0);
  }, 0);
  const totalUtilized = projects.reduce((sum, p) => {
    if (!p.fundUtilization) return sum;
    return sum + Object.values(p.fundUtilization).reduce((s, v) => s + (v?.used || 0), 0);
  }, 0);
  const additionalRequests = projects.reduce((count, p) => count + (p.additionalFundRequests?.length || 0), 0);
  const roadsSaved = projects.filter(p => canUnlockRoad(p) || p.roadConstructionUnlocked).length;
  const completedOnTime = projects.filter(p => p.status === 'completed').length;
  const coordinationScore = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => {
        if (!p.departmentStatuses) return sum;
        const responded = Object.values(p.departmentStatuses).filter(s => s !== 'pending').length;
        return sum + (responded / DEPARTMENTS.length) * 100;
      }, 0) / projects.length)
    : 0;

  return {
    totalActive: active.length,
    awaitingResponses: awaitingResponses.length,
    pendingDeptWork,
    totalAllocated,
    totalUtilized,
    additionalRequests,
    avgApprovalTime: 4.2,
    coordinationScore,
    roadsSaved,
    estimatedSavings: roadsSaved * 35,
    onTimeRate: projects.length > 0 ? Math.round((completedOnTime / Math.max(projects.length, 1)) * 100) : 0,
  };
};

// ─── CONTEXT PROVIDER ───────────────────────────────────────────────
export function GovProvider({ children }) {
  const [escrowFunds, setEscrowFunds] = useState({ total: 0, released: 0, pendingVerification: 0 });
  
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('govsync_real_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local projects', e);
    }
    return [];
  });

  const [dbConnected, setDbConnected] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [aiWarnings, setAiWarnings] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Attempt to fetch state from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('app_state')
          .select('projects')
          .eq('id', 'global')
          .single();
        
        if (data && data.projects && isMounted) {
          setProjects(data.projects);
          setDbConnected(true);
        }
      } catch (err) {
        console.warn('Supabase not configured or missing app_state table. Using local storage.', err);
      } finally {
        if (isMounted) setInitialLoadComplete(true);
      }
    };
    fetchFromSupabase();
    return () => { isMounted = false; };
  }, []);

  // Persist projects to localStorage and Supabase
  useEffect(() => {
    if (!initialLoadComplete) return; // Do not overwrite cloud data on initial mount
    localStorage.setItem('govsync_real_projects', JSON.stringify(projects));
    
    // Opportunistically sync to cloud if possible
    supabase.from('app_state').upsert({ id: 'global', projects })
      .then(({ error }) => { if (!error && !dbConnected) setDbConnected(true); })
      .catch(() => {});
  }, [projects, initialLoadComplete, dbConnected]);

  // Recompute AI insights whenever projects change
  useEffect(() => {
    setAiInsights(generateAIInsights(projects));
  }, [projects]);

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = getProjectStats(projects);

  // ─── ACTIONS ────────────────────────────────────────────────────

  /** Step 1: Create a new project and auto-notify all departments */
  const createProject = (data, raisedBy = 'Admin') => {
    const id = `PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
    
    // Resolve raised by label
    let raisedByLabel = 'Admin';
    if (raisedBy !== 'Admin' && raisedBy !== 'Citizen') {
      const dept = DEPARTMENTS.find(d => d.id === raisedBy);
      raisedByLabel = dept ? `${dept.name} Department` : raisedBy;
    } else {
      raisedByLabel = raisedBy;
    }

    // AI Category mapping
    // Changed: Automatically set all departments to pending for any new project 
    // to ensure they all receive the coordination notification and questions.
    const relevantDepts = DEPARTMENTS.map(d => d.id);

    const initialStatuses = DEPARTMENTS.reduce((acc, d) => {
      acc[d.id] = relevantDepts.includes(d.id) ? 'pending' : 'not_applicable';
      return acc;
    }, {});

    const newProject = {
      id,
      name: data.name,
      ward: data.ward,
      gpsLocation: { lat: parseFloat(data.lat) || 23.26, lng: parseFloat(data.lng) || 77.41 },
      complaintType: data.complaintType,
      estimatedBudget: parseFloat(data.estimatedBudget) || 100,
      priority: data.priority || 'Medium',
      expectedTimeline: data.expectedTimeline,
      description: data.description || '',
      status: 'dept_notification',
      createdAt: new Date().toISOString().split('T')[0],
      departmentStatuses: initialStatuses,
      departmentWork: {},
      discussions: [],
      fundAllocations: {},
      fundUtilization: {},
      completionVerification: {},
      roadConstructionUnlocked: false,
      roadDepartment: null,
      additionalFundRequests: [],
      raisedBy: raisedByLabel,
      notifications: [{
        id: `n-${Date.now()}`,
        type: 'dept_notify',
        message: `${data.complaintType} planned in ${data.ward}. ${relevantDepts.length} relevant departments notified via AI Detection.`,
        timestamp: new Date().toISOString(),
        read: false,
      }],
      aiCoordination: {
        status: 'departments_notified',
        departmentResponses: {},
        aiPredictions: {},
        adminDecisions: {},
        decisionLog: [],
        workflowTimeline: [
          { stage: 'project_created', timestamp: new Date().toISOString() },
          { stage: 'departments_notified', timestamp: new Date().toISOString(), note: `Auto-notified ${relevantDepts.length} departments` }
        ],
      },
    };

    // Generate simulated AI predictions for each department
    DEPARTMENTS.forEach(dept => {
      newProject.aiCoordination.aiPredictions[dept.id] = generateAIPrediction(dept.id, newProject, null);
    });

    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  /** Step 3: Department submits its response (yes/no/completed + work details) */
  const submitDeptResponse = (projectId, deptId, response, workDetails = null) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newStatuses = { ...p.departmentStatuses, [deptId]: response };
      const newWork = { ...p.departmentWork };
      if (response === 'yes' && workDetails) {
        newWork[deptId] = { ...workDetails, progress: 0 };
      }
      // Check if all relevant departments have responded
      const allResponded = DEPARTMENTS.every(d => newStatuses[d.id] !== 'pending');
      const hasWork = Object.values(newStatuses).some(s => s === 'yes');
      let newStatus = p.status;
      if (allResponded) {
        newStatus = hasWork ? 'dept_coordination' : 'all_clear';
      } else {
        newStatus = 'dept_coordination';
      }

      const dept = getDeptById(deptId);
      const newNotifications = [...(p.notifications || []), {
        id: `n-${Date.now()}-${deptId}`,
        type: 'response',
        dept: deptId,
        message: `${dept?.name}: ${response === 'yes' ? `Work required – ${workDetails?.workType || 'Pending details'}` : response === 'no' ? 'No work planned.' : 'Work already completed.'}`,
        timestamp: new Date().toISOString(),
        read: false,
      }];

      // Synchronize with AI Coordination Workflow
      const aiCoord = p.aiCoordination ? { ...p.aiCoordination } : null;
      if (aiCoord) {
        const coordResponse = {
          currentWork: response === 'yes' ? 'yes' : 'no',
          futureWork: 'no',
          conflictRisk: response === 'yes' ? 'high' : 'low',
          remarks: response === 'yes' ? `Work required: ${workDetails?.workType || ''}` : `Department reported: ${response}`,
          details: workDetails ? { ...workDetails } : null,
          respondedAt: new Date().toISOString()
        };
        aiCoord.departmentResponses = {
          ...aiCoord.departmentResponses,
          [deptId]: coordResponse,
        };
        aiCoord.aiPredictions = {
          ...aiCoord.aiPredictions,
          [deptId]: generateAIPrediction(deptId, p, coordResponse),
        };
        
        // If all responded, advance workflow
        if (allResponded && aiCoord.status === 'departments_notified') {
          aiCoord.status = 'ai_analyzing';
          aiCoord.workflowTimeline = [...(aiCoord.workflowTimeline || []), {
            stage: 'responses_received', timestamp: new Date().toISOString(), note: 'All departments have responded.'
          }];
          setTimeout(() => {
            setProjects(prv => prv.map(pr => {
              if (pr.id !== projectId || !pr.aiCoordination) return pr;
              return {
                ...pr,
                aiCoordination: {
                  ...pr.aiCoordination,
                  status: 'comparison_ready',
                  workflowTimeline: [...(pr.aiCoordination.workflowTimeline || []), {
                    stage: 'comparison_ready', timestamp: new Date().toISOString(), note: 'AI analysis complete. Ready for admin review.'
                  }]
                }
              };
            }));
          }, 3000);
        }
      }

      return {
        ...p,
        departmentStatuses: newStatuses,
        departmentWork: newWork,
        status: newStatus,
        notifications: newNotifications,
        aiCoordination: aiCoord || p.aiCoordination,
      };
    }));
  };

  /** Step 6: Set fund allocations for a project */
  const setFundAllocation = (projectId, allocations) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, fundAllocations: { ...p.fundAllocations, ...allocations } };
    }));
  };

  /** Step 7: Update department fund utilization */
  const updateFundUtilization = (projectId, deptId, utilData) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        fundUtilization: {
          ...p.fundUtilization,
          [deptId]: { ...p.fundUtilization[deptId], ...utilData },
        },
      };
    }));
  };

  /** Step 7: Update department work progress */
  const updateDeptWorkProgress = (projectId, deptId, progressPercent) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newWork = { ...p.departmentWork };
      if (newWork[deptId]) {
        newWork[deptId] = { ...newWork[deptId], progress: progressPercent };
      }
      // If progress hits 100, update department status
      const newStatuses = { ...p.departmentStatuses };
      if (progressPercent >= 100) {
        newStatuses[deptId] = 'completed';
      }
      return { ...p, departmentWork: newWork, departmentStatuses: newStatuses };
    }));
  };

  /** Step 8: Submit completion verification for a department */
  const submitCompletionVerification = (projectId, deptId, verificationData) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newVerification = {
        ...p.completionVerification,
        [deptId]: { ...verificationData, verified: true },
      };
      const newStatuses = { ...p.departmentStatuses, [deptId]: 'completed' };

      const dept = getDeptById(deptId);
      const newNotifications = [...(p.notifications || []), {
        id: `n-${Date.now()}-verify-${deptId}`,
        type: 'completion',
        dept: deptId,
        message: `${dept?.name} work completed and verified.`,
        timestamp: new Date().toISOString(),
        read: false,
      }];

      return {
        ...p,
        completionVerification: newVerification,
        departmentStatuses: newStatuses,
        notifications: newNotifications,
      };
    }));
  };

  /** Step 9: Check and unlock road construction */
  const checkAndUnlockRoad = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const unlocked = canUnlockRoad(p);
      if (unlocked && !p.roadConstructionUnlocked) {
        return {
          ...p,
          roadConstructionUnlocked: true,
          status: 'road_approved',
          notifications: [...(p.notifications || []), {
            id: `n-${Date.now()}-unlock`,
            type: 'approval',
            message: 'Road Construction Approved! All prerequisite work completed.',
            timestamp: new Date().toISOString(),
            read: false,
          }],
        };
      }
      return p;
    }));
  };

  /** Step 10: Update road department progress */
  const updateRoadDepartment = (projectId, roadData) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const currentRoad = p.roadDepartment || {};
      const newRoadDept = { ...currentRoad, ...roadData };
      let newStatus = p.status;
      if (newRoadDept.progress >= 100) {
        newStatus = 'completed';
      }
      return { ...p, roadDepartment: newRoadDept, status: newStatus };
    }));
  };

  /** Step 11: Submit additional fund request */
  const submitAdditionalFundRequest = (projectId, requestData) => {
    const reqId = `AFR-${String(Math.floor(Math.random() * 900) + 100)}`;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        additionalFundRequests: [...(p.additionalFundRequests || []), {
          id: reqId,
          ...requestData,
          stages: { road: 'approved', commissioner: 'pending', finance: 'pending', government: 'pending' },
          status: 'under_review',
          createdAt: new Date().toISOString().split('T')[0],
        }],
      };
    }));
  };

  /** Step 11: Approve additional fund at a specific stage */
  const approveAdditionalFund = (projectId, requestId, stage) => {
    const stageOrder = ['road', 'commissioner', 'finance', 'government'];
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newRequests = p.additionalFundRequests.map(r => {
        if (r.id !== requestId) return r;
        const newStages = { ...r.stages, [stage]: 'approved' };
        const currentIdx = stageOrder.indexOf(stage);
        // Auto-set next stage to pending if needed
        if (currentIdx < stageOrder.length - 1) {
          const nextStage = stageOrder[currentIdx + 1];
          if (newStages[nextStage] === 'pending') {
            // leave as pending, it's ready for next approval
          }
        }
        const allApproved = stageOrder.every(s => newStages[s] === 'approved');
        return { ...r, stages: newStages, status: allApproved ? 'approved' : 'under_review' };
      });
      return { ...p, additionalFundRequests: newRequests };
    }));
  };

  /** Phase 7: Add discussion message */
  const addDiscussionMessage = (projectId, sender, text) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender,
        text,
        timestamp: new Date().toISOString()
      };
      
      const mentions = DEPARTMENTS.filter(d => text.toLowerCase().includes(`@${d.name.toLowerCase()}`));
      const newNotifications = [...(p.notifications || [])];
      
      mentions.forEach(d => {
        newNotifications.push({
          id: `n-${Date.now()}-mention-${d.id}`,
          type: 'mention',
          dept: d.id,
          message: `${sender} mentioned you in ${p.name}: "${text}"`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      });

      return {
        ...p,
        discussions: [...(p.discussions || []), newMessage],
        notifications: newNotifications
      };
    }));
  };

  /** Phase 14: Emergency Override */
  const emergencyOverride = (projectId, reason) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      const newStatuses = { ...p.departmentStatuses };
      // Force complete any pending/yes departments
      DEPARTMENTS.forEach(d => {
        if (newStatuses[d.id] === 'pending' || newStatuses[d.id] === 'yes') {
          newStatuses[d.id] = 'completed'; // Forcibly complete
        }
      });
      
      return {
        ...p,
        roadConstructionUnlocked: true,
        status: 'road_approved',
        departmentStatuses: newStatuses,
        notifications: [...(p.notifications || []), {
          id: `n-${Date.now()}-emergency`,
          type: 'alert',
          message: `🚨 EMERGENCY OVERRIDE ENABLED: Road Construction Force Unlocked. Reason: ${reason}`,
          timestamp: new Date().toISOString(),
          read: false,
        }],
        discussions: [...(p.discussions || []), {
          id: `msg-emergency-${Date.now()}`,
          sender: 'SYSTEM',
          text: `🚨 EMERGENCY OVERRIDE: Road unlocked by Admin. Reason: ${reason}`,
          timestamp: new Date().toISOString()
        }]
      };
    }));
  };

  // ─── AI COORDINATION ACTIONS ──────────────────────────────────────

  /** Auto-generate AI predictions for a project's coordination data */
  const generateAIPredictions = useCallback((projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId || !p.aiCoordination) return p;
      const coord = p.aiCoordination;
      const predictions = {};
      DEPARTMENTS.forEach(dept => {
        const deptResp = coord.departmentResponses?.[dept.id];
        predictions[dept.id] = generateAIPrediction(dept.id, p, deptResp);
      });
      return {
        ...p,
        aiCoordination: { ...coord, aiPredictions: predictions },
      };
    }));
  }, []);

  // Auto-generate AI predictions for seed data on first load
  useEffect(() => {
    projects.forEach(p => {
      if (p.aiCoordination && (!p.aiCoordination.aiPredictions || Object.keys(p.aiCoordination.aiPredictions).length === 0)) {
        generateAIPredictions(p.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Submit department coordination questionnaire response */
  const submitDeptCoordinationResponse = (projectId, deptId, response) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId || !p.aiCoordination) return p;
      const coord = { ...p.aiCoordination };
      coord.departmentResponses = {
        ...coord.departmentResponses,
        [deptId]: { ...response, respondedAt: new Date().toISOString() },
      };
      // Regenerate AI prediction for this department
      coord.aiPredictions = {
        ...coord.aiPredictions,
        [deptId]: generateAIPrediction(deptId, p, response),
      };
      // Check if all departments have responded
      const allResponded = DEPARTMENTS.every(d => coord.departmentResponses[d.id]?.respondedAt);
      if (allResponded && coord.status === 'departments_notified') {
        coord.status = 'ai_analyzing';
        coord.workflowTimeline = [...(coord.workflowTimeline || []), {
          stage: 'responses_received', timestamp: new Date().toISOString(), note: 'All departments have responded.'
        }];
        // Auto-advance to comparison_ready after a short simulated delay
        setTimeout(() => {
          setProjects(prv => prv.map(pr => {
            if (pr.id !== projectId) return pr;
            return {
              ...pr,
              aiCoordination: {
                ...pr.aiCoordination,
                status: 'comparison_ready',
                workflowTimeline: [...(pr.aiCoordination.workflowTimeline || []), {
                  stage: 'comparison_ready', timestamp: new Date().toISOString(), note: 'AI analysis complete. Ready for admin review.'
                }],
              },
            };
          }));
        }, 1500);
      }
      coord.decisionLog = [...(coord.decisionLog || []), {
        timestamp: new Date().toISOString(),
        action: 'Department Response',
        actor: getDeptById(deptId)?.name || deptId,
        notes: `Responded: Current Work = ${response.currentWork}, Future Work = ${response.futureWork}`,
      }];
      return { ...p, aiCoordination: coord };
    }));
  };

  /** Admin submits decision for a specific department */
  const submitAdminCoordinationDecision = (projectId, deptId, decision, notes = '') => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId || !p.aiCoordination) return p;
      const coord = { ...p.aiCoordination };
      coord.adminDecisions = {
        ...coord.adminDecisions,
        [deptId]: { decision, notes, timestamp: new Date().toISOString() },
      };
      const preReviewStages = ['project_created', 'departments_notified', 'responses_received', 'ai_analyzing', 'comparison_ready'];
      if (preReviewStages.includes(coord.status)) {
        coord.status = 'admin_review';
        if (!coord.workflowTimeline?.some(w => w.stage === 'admin_review')) {
          coord.workflowTimeline = [...(coord.workflowTimeline || []), {
            stage: 'admin_review', timestamp: new Date().toISOString(), note: 'Admin has begun making coordination decisions.'
          }];
        }
      }
      coord.decisionLog = [...(coord.decisionLog || []), {
        timestamp: new Date().toISOString(),
        action: `Admin Decision: ${decision}`,
        actor: 'Admin',
        notes: `${getDeptById(deptId)?.name}: ${decision}${notes ? ' — ' + notes : ''}`,
      }];
      return { ...p, aiCoordination: coord };
    }));
  };

  /** Finalize coordination — generate integrated summary, fund optimization, tender recommendation */
  const finalizeCoordination = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId || !p.aiCoordination) return p;
      const coord = { ...p.aiCoordination };
      const responses = coord.departmentResponses || {};
      const predictions = coord.aiPredictions || {};
      const decisions = coord.adminDecisions || {};

      // Build integrated summary
      const summary = {};
      let participating = 0;
      let predictedFuture = 0;
      let totalDeptBudget = 0;
      let totalAiBudget = 0;

      DEPARTMENTS.forEach(dept => {
        const resp = responses[dept.id];
        const pred = predictions[dept.id];
        const dec = decisions[dept.id];
        const hasCurrentWork = resp?.currentWork === 'yes';
        const hasFutureWork = resp?.futureWork === 'yes';
        const aiPredicts = pred?.predictsFutureWork;

        if (hasCurrentWork || hasFutureWork) participating++;
        if (pred?.disagreesWithDept) predictedFuture++;

        const effectiveBudget = dec?.decision === 'approve_ai'
          ? (pred?.aiBudgetEstimate || 0)
          : dec?.decision === 'merge'
            ? Math.round(((resp?.details?.estimatedCost || 0) + (pred?.aiBudgetEstimate || 0)) / 2 * 10) / 10
            : (resp?.details?.estimatedCost || 0);

        totalDeptBudget += resp?.details?.estimatedCost || 0;
        totalAiBudget += pred?.aiBudgetEstimate || 0;

        summary[dept.id] = {
          currentWork: hasCurrentWork,
          futureWork: hasFutureWork,
          aiPredicts,
          adminDecision: dec?.decision || 'pending',
          effectiveBudget,
        };
      });

      coord.integratedSummary = {
        departments: summary,
        totalDepartments: DEPARTMENTS.length,
        participating,
        predictedFuture,
        totalDeptBudget: Math.round(totalDeptBudget * 10) / 10,
        totalAiBudget: Math.round(totalAiBudget * 10) / 10,
        optimizedBudget: Math.round(Math.min(totalDeptBudget, totalAiBudget) * 0.95 * 10) / 10,
        savings: Math.round(Math.abs(totalDeptBudget - totalAiBudget * 0.95) * 10) / 10,
      };

      // AI project recommendation
      const participationRate = participating / DEPARTMENTS.length;
      if (participationRate > 0.5) {
        coord.aiRecommendation = 'integrated_tender';
      } else if (participationRate > 0.25) {
        coord.aiRecommendation = 'proceed';
      } else if (predictedFuture > 2) {
        coord.aiRecommendation = 'delay';
      } else {
        coord.aiRecommendation = 'proceed';
      }

      // Tender recommendation
      coord.tenderRecommendation = {
        type: participating > 4 ? 'integrated' : 'separate',
        reason: participating > 4
          ? `${participating} departments participating. Integrated tender recommended for cost efficiency and reduced excavation cycles.`
          : `${participating} departments participating. Separate tenders recommended for specialized contractor selection.`,
        estimatedSavings: Math.round(totalDeptBudget * 0.08),
      };

      // Fund optimization
      coord.fundOptimization = {};
      DEPARTMENTS.forEach(dept => {
        const resp = responses[dept.id];
        const pred = predictions[dept.id];
        if (resp?.details?.estimatedCost || pred?.aiBudgetEstimate) {
          coord.fundOptimization[dept.id] = {
            deptEstimate: resp?.details?.estimatedCost || 0,
            aiEstimate: pred?.aiBudgetEstimate || 0,
            optimized: Math.round(Math.min(resp?.details?.estimatedCost || Infinity, pred?.aiBudgetEstimate || Infinity) * 0.97 * 10) / 10,
            fundingAvailable: (resp?.details?.estimatedCost || 0) > 0,
          };
        }
      });

      coord.status = 'funds_optimized';
      coord.workflowTimeline = [...(coord.workflowTimeline || []),
        { stage: 'admin_review', timestamp: new Date().toISOString(), note: 'Admin decisions finalized for all departments.' },
        { stage: 'funds_optimized', timestamp: new Date().toISOString(), note: 'AI fund optimization engine completed analysis.' },
        { stage: 'budget_integrated', timestamp: new Date().toISOString(), note: 'Integrated project budget generated.' },
        { stage: 'tender_recommended', timestamp: new Date().toISOString(), note: `AI recommends ${coord.tenderRecommendation.type} tender.` },
      ];

      coord.decisionLog = [...(coord.decisionLog || []), {
        timestamp: new Date().toISOString(),
        action: 'Coordination Finalized',
        actor: 'Admin',
        notes: `Integrated summary generated. AI recommends: ${coord.aiRecommendation}. Tender: ${coord.tenderRecommendation.type}.`,
      }];

      return { ...p, aiCoordination: coord };
    }));
  };

  // ─── Legacy actions (preserved for compatibility) ─────────────


  const submitWorkOrder = async (deptName, name, lat, lng, locationDesc, scope, timeline) => {
    const deptSlug = deptName.toLowerCase().split(' ')[0];
    const newId = `${deptSlug.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
    setProjects(prev => [{
      id: newId,
      dept: deptName,
      deptSlug: deptSlug,
      name,
      contractor: 'Unassigned',
      status: 'Awaiting Responses',
      amount: Math.floor(Math.random() * 20) + 5,
      progress: 0,
      milestone: 'Pending',
      conflict: null,
      location: locationDesc || '',
      scope: scope || '',
      timeline: timeline || '',
      responses: [],
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      submittedAt: new Date().toLocaleDateString(),
    }, ...prev]);
  };

  const submitDepartmentResponse = async (projectId, deptName, reqTimeline, reqBudget) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newResponses = [...(p.responses || []), { dept: deptName, timeline: reqTimeline, budget: reqBudget }];
        return { ...p, responses: newResponses, status: 'Responses Received' };
      }
      return p;
    }));
  };

  const submitContractorBid = (projectId, contractorEmail, amount, duration, notes) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newBids = [...(p.bids || []), {
        contractorEmail,
        amount,
        duration,
        notes,
        timestamp: new Date().toISOString()
      }];
      return { ...p, bids: newBids };
    }));
  };

  const awardTender = (projectId, winningBid) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        awardedBid: winningBid,
        contractor: winningBid.contractorEmail,
        amount: winningBid.amount, // Update budget to awarded amount
        status: 'Tender Awarded', // Legacy status
        aiCoordination: {
          ...p.aiCoordination,
          status: 'tender_approved',
          workflowTimeline: [
            ...(p.aiCoordination?.workflowTimeline || []),
            { stage: 'tender_approved', timestamp: new Date().toISOString(), note: `Tender awarded to ${winningBid.contractorEmail} for ₹${winningBid.amount}L.` }
          ]
        }
      };
    }));
  };

  const sanctionBudget = (projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        budgetSanctioned: true,
        status: 'Approved',
        aiCoordination: {
          ...p.aiCoordination,
          status: 'executing',
          workflowTimeline: [
            ...(p.aiCoordination?.workflowTimeline || []),
            { stage: 'executing', timestamp: new Date().toISOString(), note: 'Budget Sanctioned by Finance. Work Order Issued.' }
          ]
        }
      };
    }));
  };

  const releaseMilestonePayout = (projectId, payoutAmount, milestoneNote) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newMilestones = [...(p.paidMilestones || []), {
        amount: payoutAmount,
        note: milestoneNote,
        timestamp: new Date().toISOString()
      }];
      return { ...p, paidMilestones: newMilestones };
    }));
  };

  const generateAIConflict = async (projectId) => {
    const warnId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
    setAiWarnings(prev => [{
      id: warnId,
      projectRef: projectId,
      title: 'Schedule & Spatial Conflict Detected',
      message: 'Multiple departments have submitted overlapping timelines for this location.',
      acknowledged: false,
    }, ...prev]);
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'Blocked', conflict: 'Overlapping department timelines.' } : p
    ));
  };

  const approveMasterPlan = async (projectId) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, status: 'Approved', conflict: null, milestone: 'Master Plan Sequenced' } : p
    ));
    setAiWarnings(prev => prev.filter(w => w.projectRef !== projectId));
  };

  const updateExecutionProgress = async (projectId, progressPercent, currentMilestone) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          progress: progressPercent,
          milestone: currentMilestone || p.milestone,
          status: progressPercent >= 100 ? 'Completed' : 'Approved',
        };
      }
      return p;
    }));
  };

  const acknowledgeAiWarning = async (warningId, projectRef) => {
    setAiWarnings(prev => prev.filter(w => w.id !== warningId));
    setProjects(prev => prev.map(p =>
      p.id === projectRef ? { ...p, status: 'Approved', conflict: null } : p
    ));
  };

  const requestPayout = async (projectId) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, payoutRequested: true } : p
    ));
  };

  const authorizeRelease = async (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    setEscrowFunds(prev => ({
      ...prev,
      released: prev.released + (proj.amount || 0),
      total: prev.total - (proj.amount || 0),
    }));
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, payoutRequested: false, status: 'Completed', progress: 100 } : p
    ));
  };

  const coordinateProject = async (projectId, contractor, amount) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? {
        ...p,
        contractor: contractor || 'L&T Infra',
        amount: parseFloat(amount) || p.amount,
        status: 'Approved',
        milestone: 'Initial Survey',
      } : p
    ));
  };

  const injectCapital = async (amount) => {
    setEscrowFunds(prev => ({ ...prev, total: prev.total + parseFloat(amount) }));
  };

  return (
    <GovContext.Provider value={{
      // State
      escrowFunds,
      projects,
      aiWarnings,
      aiInsights,
      loading,
      error,
      stats,
      DEPARTMENTS,

      // New workflow actions
      createProject,
      submitDeptResponse,
      setFundAllocation,
      updateFundUtilization,
      updateDeptWorkProgress,
      submitCompletionVerification,
      checkAndUnlockRoad,
      updateRoadDepartment,
      submitAdditionalFundRequest,
      approveAdditionalFund,
      addDiscussionMessage,
      emergencyOverride,

      // AI Coordination Engine actions
      generateAIPredictions,
      submitDeptCoordinationResponse,
      submitAdminCoordinationDecision,
      finalizeCoordination,

      // Legacy actions
      submitWorkOrder,
      submitDepartmentResponse,
      submitContractorBid,
      awardTender,
      sanctionBudget,
      releaseMilestonePayout,
      generateAIConflict,
      approveMasterPlan,
      updateExecutionProgress,
      acknowledgeAiWarning,
      requestPayout,
      authorizeRelease,
      coordinateProject,
      injectCapital,
    }}>
      {children}
    </GovContext.Provider>
  );
}

export const useGovContext = () => useContext(GovContext);
