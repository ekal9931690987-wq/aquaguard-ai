/**
 * AquaGuard AI - Issue Classification & Severity Assessment Engine
 * Performs intelligent classification, severity grading, department routing,
 * and estimated impact calculations for water and civic infrastructure issues.
 */

const CATEGORIES = {
  PIPE_BURST: {
    id: 'pipe_burst',
    name: 'Pipe Burst / High Pressure Leakage',
    department: 'Water Supply & Main Pipelines',
    baseSLA: '4 hours',
    keywords: ['burst', 'rupture', 'gushing', 'jet', 'torrent', 'broken pipe', 'pipeline leak', 'spraying', 'crack in pipe', 'main line', 'water loss', 'flooding road', 'blown pipe']
  },
  SEWAGE_OVERFLOW: {
    id: 'sewage_overflow',
    name: 'Sewage Overflow / Wastewater Hazard',
    department: 'Sanitation & Wastewater Management',
    baseSLA: '6 hours',
    keywords: ['sewage', 'sewer', 'black water', 'foul smell', 'stink', 'drainage overflow', 'gutter spill', 'manhole spilling', 'waste water', 'septic', 'contamination smell']
  },
  WATER_CONTAMINATION: {
    id: 'water_contamination',
    name: 'Drinking Water Contamination / Quality Issue',
    department: 'Public Health & Water Quality Division',
    baseSLA: '4 hours',
    keywords: ['dirty water', 'brown water', 'yellow water', 'muddy tap', 'bad smell', 'foul taste', 'drinking water', 'worms', 'turbid', 'chlorine smell', 'chemical taste', 'poison', 'sick']
  },
  DRAINAGE_CLOG: {
    id: 'drainage_clog',
    name: 'Stormwater Drainage Clog / Urban Flooding',
    department: 'Stormwater & Drainage Engineering',
    baseSLA: '12 hours',
    keywords: ['drain clog', 'blocked drain', 'choked gutter', 'waterlogged', 'stagnant water', 'culvert blocked', 'rainwater puddle', 'debris in drain', 'canal block']
  },
  LOW_PRESSURE: {
    id: 'low_pressure',
    name: 'Low / No Water Pressure',
    department: 'Distribution & Booster Stations',
    baseSLA: '24 hours',
    keywords: ['no water', 'dry tap', 'very low pressure', 'trickle', 'not reaching top floor', 'pressure drop', 'water cut', 'supply interrupted', 'irregular supply']
  },
  OPEN_MANHOLE: {
    id: 'open_manhole',
    name: 'Open Manhole / Uncovered Sump Danger',
    department: 'Emergency Road & Safety Infrastructure',
    baseSLA: '2 hours',
    keywords: ['open manhole', 'missing cover', 'uncovered drain', 'manhole lid', 'open pit', 'chamber open', 'fall risk', 'road hazard', 'broken slab']
  },
  DAMAGED_METER: {
    id: 'damaged_meter',
    name: 'Damaged Water Meter / Valve Defect',
    department: 'Metering & Consumer Connections',
    baseSLA: '48 hours',
    keywords: ['meter broken', 'leaking meter', 'valve stuck', 'wheel broken', 'meter glass', 'spinning fast', 'tampered meter', 'inlet valve', 'sub-meter']
  },
  ILLEGAL_TAPPING: {
    id: 'illegal_tapping',
    name: 'Illegal Water Tapping / Wastage',
    department: 'Vigilance & Enforcement Squad',
    baseSLA: '24 hours',
    keywords: ['illegal connection', 'direct pump', 'suction pump', 'theft', 'unauthorized tap', 'wasting water', 'hose running', 'commercial misuse']
  }
};

const SEVERITY_RULES = [
  {
    level: 'Critical',
    keywords: ['urgent', 'emergency', 'massive', 'hazard', 'life-threatening', 'collapsed', 'danger', 'hospital', 'school', 'deep pit', 'open manhole', 'gushing', 'torrent', 'poison'],
    score: 95,
    slaHours: 4,
    color: '#EF476F'
  },
  {
    level: 'High',
    keywords: ['heavy', 'severe', 'drinking water', 'overflow', 'large leak', 'entire street', 'flooding', 'no water for days', 'sewage', 'contaminated'],
    score: 75,
    slaHours: 12,
    color: '#FF7D00'
  },
  {
    level: 'Medium',
    keywords: ['moderate', 'trickle', 'clogged', 'slow drain', 'meter leak', 'noisy valve', 'puddle', 'low pressure'],
    score: 50,
    slaHours: 48,
    color: '#FFD166'
  },
  {
    level: 'Low',
    keywords: ['slight', 'minor', 'dripping', 'seepage', 'cosmetic', 'paint', 'query', 'routine'],
    score: 25,
    slaHours: 72,
    color: '#06D6A0'
  }
];

/**
 * Analyzes issue title, description, and optional photo metadata to classify and score
 */
function analyzeIssue({ title = '', description = '', categoryOverride = null, hasPhoto = false, fileName = '' }) {
  const combinedText = `${title} ${description} ${fileName}`.toLowerCase();
  
  // 1. Determine Category
  let matchedCategory = null;
  let highestScore = 0;

  for (const [key, cat] of Object.entries(CATEGORIES)) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    if (title.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0])) {
      score += 4;
    }
    if (score > highestScore) {
      highestScore = score;
      matchedCategory = cat;
    }
  }

  // Fallback category if no keywords match
  if (!matchedCategory || highestScore === 0) {
    if (categoryOverride && CATEGORIES[categoryOverride]) {
      matchedCategory = CATEGORIES[categoryOverride];
    } else {
      matchedCategory = CATEGORIES.PIPE_BURST; // Default civic water issue
    }
  }

  // 2. Determine Severity
  let severityLevel = 'Medium';
  let severityScore = 55;
  let targetSLA = matchedCategory.baseSLA;
  let severityColor = '#FFD166';

  // Specific override for critical danger categories
  if (matchedCategory.id === 'open_manhole') {
    severityLevel = 'Critical';
    severityScore = 98;
    targetSLA = '2 hours';
    severityColor = '#EF476F';
  } else if (matchedCategory.id === 'water_contamination') {
    severityLevel = 'High';
    severityScore = 85;
    targetSLA = '4 hours';
    severityColor = '#FF7D00';
  } else {
    // Check keywords
    for (const rule of SEVERITY_RULES) {
      const match = rule.keywords.some(kw => combinedText.includes(kw));
      if (match) {
        severityLevel = rule.level;
        severityScore = rule.score;
        targetSLA = `${rule.slaHours} hours`;
        severityColor = rule.color;
        break;
      }
    }
  }

  // Calculate confidence score (simulated AI model confidence between 86% and 98%)
  const confidence = Math.min(98, Math.max(86, 82 + (highestScore * 3) + (hasPhoto ? 6 : 0)));

  // Equipment recommendations based on category and severity
  const equipmentMap = {
    pipe_burst: ['High-Pressure Pipe Clamp (4"-8")', 'Portable Dewatering Sump Pump', 'Hydraulic Pipe Cutter', 'Reflective Barricades'],
    sewage_overflow: ['Suction Vacuum Tanker', 'Jetting Cleaning Machine', 'Disinfectant Spraying Unit', 'Hazmat Gloves & Masks'],
    water_contamination: ['Digital Spectrophotometer Kit', 'Turbidity Meter', 'Chlorine Dosing Unit', 'Sterile Sampling Bottles'],
    drainage_clog: ['Mechanical Desilting Machine', 'High-Flow Submersible Pump', 'Clog Breaking Rods'],
    low_pressure: ['Flow Rate Ultrasonic Meter', 'Inline Pressure Logger', 'Booster Valve Calibrator'],
    open_manhole: ['Cast Iron Heavy-Duty Cover (D400)', 'Solar Warning Flasher Pin', 'Manhole Grating Hook'],
    damaged_meter: ['Digital AMR Water Meter (15mm/25mm)', 'Brass Stopcock Replacement', 'Security Tamper Seal'],
    illegal_tapping: ['Pipe Acoustic Locator', 'Legal Notice Issuance Kit', 'Bypass Disconnection Clamp']
  };

  // Water Loss Impact Estimation
  let estimatedWaterLoss = 'Negligible / Non-leak issue';
  if (matchedCategory.id === 'pipe_burst') {
    estimatedWaterLoss = severityLevel === 'Critical' ? '~4,800 Liters / Hour' : severityLevel === 'High' ? '~2,200 Liters / Hour' : '~850 Liters / Hour';
  } else if (matchedCategory.id === 'damaged_meter') {
    estimatedWaterLoss = '~150 Liters / Hour';
  }

  // AI Visual Features / Simulated Vision Tags
  const visualTags = [];
  if (hasPhoto) {
    if (matchedCategory.id === 'pipe_burst') visualTags.push('Water Surface Jet', 'Pavement Saturation', 'High Pressure Flow');
    else if (matchedCategory.id === 'sewage_overflow') visualTags.push('Dark Effluent Spill', 'Manhole Surcharge', 'Pedestrian Risk');
    else if (matchedCategory.id === 'water_contamination') visualTags.push('High Turbidity', 'Discolored Fluid (Brownish)', 'Sedimentation');
    else if (matchedCategory.id === 'open_manhole') visualTags.push('Missing Cover', 'Void Cavity', 'Severe Roadway Danger');
    else visualTags.push('Infrastructure Anomaly Detected', 'Pavement Dampness');
  }

  return {
    category: matchedCategory.name,
    categoryId: matchedCategory.id,
    department: matchedCategory.department,
    severity: severityLevel,
    severityScore,
    severityColor,
    confidence: `${confidence}%`,
    targetSLA,
    estimatedWaterLoss,
    recommendedEquipment: equipmentMap[matchedCategory.id] || ['Standard Toolkit', 'Safety Cones'],
    visualTags,
    aiModelUsed: 'AquaGuard-Vision-v4.2-CivicEngine',
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeIssue,
  CATEGORIES,
  SEVERITY_RULES
};
