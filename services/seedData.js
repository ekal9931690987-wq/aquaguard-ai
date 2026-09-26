/**
 * AquaGuard AI - Initial Seed Data for Demo & Showcase
 * Provides rich real-world infrastructure issues across diverse categories,
 * severities, locations, and lifecycle statuses.
 */

const sampleIssues = [
  {
    ticketId: 'AQ-2026-1081',
    title: 'High Pressure Water Main Burst on 5th Ave',
    description: 'Underground 8-inch cast iron pipe ruptured. Water gushing through pavement asphalt and flooding two traffic lanes. Roadway erosion hazard.',
    citizenName: 'Marcus Vance',
    citizenContact: '+1 (555) 234-8901',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
    category: 'Pipe Burst / High Pressure Leakage',
    categoryId: 'pipe_burst',
    severity: 'Critical',
    status: 'In Progress',
    assignedDepartment: 'Water Supply & Main Pipelines',
    assignedOfficer: 'Officer Sarah Chen (Squad Leader)',
    location: {
      address: '742 5th Avenue, Midtown Crossing',
      landmark: 'Near Central Plaza Fountain',
      ward: 'Ward 1 - Downtown Civic',
      coordinates: { lat: 40.7628, lng: -73.9744 }
    },
    aiAnalysis: {
      category: 'Pipe Burst / High Pressure Leakage',
      categoryId: 'pipe_burst',
      severity: 'Critical',
      severityScore: 96,
      severityColor: '#EF476F',
      confidence: '97%',
      targetSLA: '4 hours',
      estimatedWaterLoss: '~4,800 Liters / Hour',
      recommendedEquipment: ['High-Pressure Pipe Clamp (8")', 'Portable Dewatering Sump Pump', 'Hydraulic Pipe Cutter', 'Reflective Barricades'],
      visualTags: ['High Pressure Jet', 'Pavement Undermining', 'Traffic Interruption'],
      aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
      analyzedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    upvotes: 8,
    duplicateOf: null,
    resolutionNotes: 'Field crew deployed. Emergency valve shutoff complete. Pipe sleeve replacement underway.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    timeline: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), updatedBy: 'Citizen Portal', note: 'Issue submitted with photo and live GPS' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), updatedBy: 'AI Dispatch Engine', note: 'Auto-routed to Squad Leader Sarah Chen based on proximity and SLA target' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), updatedBy: 'Officer Sarah Chen', note: 'Barricades placed. Excavation to expose mainline joint.' }
    ]
  },
  {
    ticketId: 'AQ-2026-1082',
    title: 'Raw Sewage Overflow Near Elementary School',
    description: 'Manhole chamber overflowing with dark wastewater and unbearable stench. Puddle is spreading towards the school pedestrian crosswalk.',
    citizenName: 'Elena Rostova',
    citizenContact: '+1 (555) 789-4321',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    category: 'Sewage Overflow / Wastewater Hazard',
    categoryId: 'sewage_overflow',
    severity: 'Critical',
    status: 'Assigned',
    assignedDepartment: 'Sanitation & Wastewater Management',
    assignedOfficer: 'Inspector Kevin Ramirez',
    location: {
      address: '118 Oakridge Boulevard, North Ward',
      landmark: 'Directly opposite Lincoln Elementary Gate 2',
      ward: 'Ward 3 - North Residential',
      coordinates: { lat: 40.7850, lng: -73.9682 }
    },
    aiAnalysis: {
      category: 'Sewage Overflow / Wastewater Hazard',
      categoryId: 'sewage_overflow',
      severity: 'Critical',
      severityScore: 94,
      severityColor: '#EF476F',
      confidence: '95%',
      targetSLA: '2 hours',
      estimatedWaterLoss: 'Hazardous Effluent',
      recommendedEquipment: ['Suction Vacuum Tanker', 'Jetting Cleaning Machine', 'Disinfectant Spraying Unit'],
      visualTags: ['Bio-Hazard Spill', 'Manhole Surcharge', 'Pedestrian Risk Area'],
      aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
      analyzedAt: new Date(Date.now() - 3600000 * 1.8).toISOString()
    },
    upvotes: 14,
    duplicateOf: null,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    timeline: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), updatedBy: 'Citizen Portal', note: 'Multiple citizen reports detected and consolidated' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(), updatedBy: 'Superintendent Davis', note: 'Priority escalated due to school zone proximity. Vacuum unit 4 dispatched.' }
    ]
  },
  {
    ticketId: 'AQ-2026-1083',
    title: 'Discolored Muddy Drinking Water from Municipal Tap',
    description: 'Water coming from municipal line is dark brownish with a strong rusty/earthy odor. Entire apartment building is unable to cook or drink.',
    citizenName: 'Devon Patel',
    citizenContact: '+1 (555) 456-1122',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
    category: 'Drinking Water Contamination / Quality Issue',
    categoryId: 'water_contamination',
    severity: 'High',
    status: 'Reported',
    assignedDepartment: 'Public Health & Water Quality Division',
    assignedOfficer: 'Unassigned',
    location: {
      address: '320 Riverside Drive, Apt 4B',
      landmark: 'Corner of 84th and Riverside',
      ward: 'Ward 2 - West Riverside',
      coordinates: { lat: 40.7891, lng: -73.9792 }
    },
    aiAnalysis: {
      category: 'Drinking Water Contamination / Quality Issue',
      categoryId: 'water_contamination',
      severity: 'High',
      severityScore: 82,
      severityColor: '#FF7D00',
      confidence: '92%',
      targetSLA: '4 hours',
      estimatedWaterLoss: 'Supply Quality Compromised',
      recommendedEquipment: ['Digital Spectrophotometer Kit', 'Turbidity Meter', 'Chlorine Dosing Unit', 'Sterile Sampling Bottles'],
      visualTags: ['High Turbidity', 'Discolored Fluid (Brownish)', 'Sedimentation'],
      aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
      analyzedAt: new Date(Date.now() - 3600000 * 0.9).toISOString()
    },
    upvotes: 5,
    duplicateOf: null,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 3600000 * 0.9).toISOString(),
    timeline: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 0.9).toISOString(), updatedBy: 'Citizen Portal', note: 'AI classified as High severity contamination; water sampling requested' }
    ]
  },
  {
    ticketId: 'AQ-2026-1084',
    title: 'Deep Uncovered Storm Manhole in Active Bikeway',
    description: 'Heavy round manhole lid is completely missing. Over 6 feet deep hole exposed in the middle of a commuter cycle lane with zero warning markers.',
    citizenName: 'Sophia Miller',
    citizenContact: '+1 (555) 321-9988',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    category: 'Open Manhole / Uncovered Sump Danger',
    categoryId: 'open_manhole',
    severity: 'Critical',
    status: 'In Progress',
    assignedDepartment: 'Emergency Road & Safety Infrastructure',
    assignedOfficer: 'Officer Maya Brooks',
    location: {
      address: '58 Broadway at Canal Street',
      landmark: 'Near Subway Entrance B',
      ward: 'Ward 1 - Downtown Civic',
      coordinates: { lat: 40.7185, lng: -74.0012 }
    },
    aiAnalysis: {
      category: 'Open Manhole / Uncovered Sump Danger',
      categoryId: 'open_manhole',
      severity: 'Critical',
      severityScore: 98,
      severityColor: '#EF476F',
      confidence: '98%',
      targetSLA: '2 hours',
      estimatedWaterLoss: 'Direct Hazard',
      recommendedEquipment: ['Cast Iron Heavy-Duty Cover (D400)', 'Solar Warning Flasher Pin', 'Manhole Grating Hook'],
      visualTags: ['Void Cavity', 'Missing Cover', 'Severe Roadway Danger'],
      aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
      analyzedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    upvotes: 19,
    duplicateOf: null,
    resolutionNotes: 'Temporary safety barricade installed. Heavy duty steel grate replacement being fitted.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeline: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), updatedBy: 'Citizen Mobile App', note: 'Report submitted with immediate high hazard flag' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), updatedBy: 'Safety Dispatch Bot', note: 'Dispatched emergency crew immediately (SLA: 2 hours)' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 0.7).toISOString(), updatedBy: 'Officer Maya Brooks', note: 'Warning cone placed; awaiting crane carrier for replacement lid.' }
    ]
  },
  {
    ticketId: 'AQ-2026-1085',
    title: 'Major Stormwater Gutter Clog & Street Flooding',
    description: 'Catch basin completely clogged by fallen branches and plastic waste. Water level up to sidewalk curb after light rain shower.',
    citizenName: 'Aiden Cooper',
    citizenContact: '+1 (555) 654-7733',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    category: 'Stormwater Drainage Clog / Urban Flooding',
    categoryId: 'drainage_clog',
    severity: 'Medium',
    status: 'Resolved',
    assignedDepartment: 'Stormwater & Drainage Engineering',
    assignedOfficer: 'Officer Ray Morales',
    location: {
      address: '921 Madison Avenue',
      landmark: 'In front of Community Library',
      ward: 'Ward 4 - East District',
      coordinates: { lat: 40.7725, lng: -73.9634 }
    },
    aiAnalysis: {
      category: 'Stormwater Drainage Clog / Urban Flooding',
      categoryId: 'drainage_clog',
      severity: 'Medium',
      severityScore: 58,
      severityColor: '#FFD166',
      confidence: '90%',
      targetSLA: '12 hours',
      estimatedWaterLoss: 'Street Drainage Stagnation',
      recommendedEquipment: ['Mechanical Desilting Machine', 'High-Flow Submersible Pump', 'Clog Breaking Rods'],
      visualTags: ['Debris Clumping', 'Storm Grate Choked', 'Curb Flooding'],
      aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
      analyzedAt: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    upvotes: 4,
    duplicateOf: null,
    resolutionNotes: 'Clog cleared with jet rodder. Grate cleared of 140kg silt and debris. Water drained smoothly.',
    resolvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    timeline: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), updatedBy: 'Citizen Portal', note: 'Initial citizen submission' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 14).toISOString(), updatedBy: 'Dispatch Coordinator', note: 'Assigned to drainage crew 2' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), updatedBy: 'Officer Ray Morales', note: 'Desilting operations initiated' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), updatedBy: 'Officer Ray Morales', note: 'Drain cleared and flow test verified 100% capacity.' }
    ]
  },
  {
    ticketId: 'AQ-2026-1086',
    title: 'Commercial Water Meter Cracked and Leaking',
    description: 'Brass connector of main commercial meter cracked during freeze. Constant spray leaking ~150 liters per hour into basement sump.',
    citizenName: 'Tanya Green',
    citizenContact: '+1 (555) 908-1234',
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
    category: 'Damaged Water Meter / Valve Defect',
    categoryId: 'damaged_meter',
    severity: 'Medium',
    status: 'Assigned',
    assignedDepartment: 'Metering & Consumer Connections',
    assignedOfficer: 'Technician Liam Scott',
    location: {
      address: '415 West 23rd Street',
      landmark: 'Service Entrance Basement',
      ward: 'Ward 2 - West Riverside',
      coordinates: { lat: 40.7465, lng: -74.0019 }
    },
    aiAnalysis: {
      category: 'Damaged Water Meter / Valve Defect',
      categoryId: 'damaged_meter',
      severity: 'Medium',
      severityScore: 52,
      severityColor: '#FFD166',
      confidence: '88%',
      targetSLA: '48 hours',
      estimatedWaterLoss: '~150 Liters / Hour',
      recommendedEquipment: ['Digital AMR Water Meter (25mm)', 'Brass Stopcock Replacement', 'Security Tamper Seal'],
      visualTags: ['Cracked Casing', 'Continuous Seepage', 'Meter Vault'],
      aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
      analyzedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    upvotes: 2,
    duplicateOf: null,
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    timeline: [
      { status: 'Reported', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), updatedBy: 'Citizen Portal', note: 'Reported by building superintendent' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 3600000 * 9).toISOString(), updatedBy: 'Metering Dept', note: 'Assigned for meter replacement' }
    ]
  }
];

module.exports = sampleIssues;
