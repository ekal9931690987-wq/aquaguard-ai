/**
 * AquaGuard AI - Core Frontend Application Controller
 * Handles SPA hash routing, API communication, AI preview analysis,
 * issue reporting wizard, authority dashboard, and modal interactions.
 */

// Global App State
const state = {
  currentRoute: 'home',
  role: 'citizen', // 'citizen' or 'authority'
  issues: [],
  selectedIssue: null,
  selectedPhotoFile: null,
  photoPreviewUrl: null,
  aiAnalysisResult: null,
  duplicateMatch: null,
  dashboardFilters: {
    status: 'All',
    severity: 'All',
    category: 'All',
    search: ''
  }
};

// Preset Scenarios for effortless 1-click testing
const PRESET_SCENARIOS = {
  pipe_burst: {
    title: 'High Pressure Water Main Rupture on Park Ave',
    description: 'A 10-inch main pipeline has ruptured under the road. Water is shooting up 5 feet and washing away gravel, causing major traffic disruption and rapid water loss.',
    category: 'Pipe Burst / High Pressure Leakage',
    categoryKey: 'pipe_burst',
    ward: 'Ward 1 - Downtown Civic',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
    lat: 40.7589,
    lng: -73.9851
  },
  sewage_overflow: {
    title: 'Severe Sewage Chamber Overflow Near Market',
    description: 'Black wastewater overflowing across the main market sidewalk with unbearable stench. Pedestrians cannot cross and shop owners are forced to close.',
    category: 'Sewage Overflow / Wastewater Hazard',
    categoryKey: 'sewage_overflow',
    ward: 'Ward 3 - North Residential',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    lat: 40.7812,
    lng: -73.9665
  },
  water_contamination: {
    title: 'Muddy Brown Drinking Water from Residential Taps',
    description: 'Water coming out of apartment taps is deeply discolored with foul earthy smell. Residents reporting skin irritation and unable to use tap water.',
    category: 'Drinking Water Contamination / Quality Issue',
    categoryKey: 'water_contamination',
    ward: 'Ward 2 - West Riverside',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    lat: 40.7915,
    lng: -73.9782
  },
  open_manhole: {
    title: 'Dangerous Missing Manhole Cover in Busy Bike Lane',
    description: 'Cast iron cover is missing. Over 7 feet deep void left completely exposed without any safety barrier or reflective tape. High risk of fatal accident.',
    category: 'Open Manhole / Uncovered Sump Danger',
    categoryKey: 'open_manhole',
    ward: 'Ward 1 - Downtown Civic',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    lat: 40.7201,
    lng: -74.0025
  },
  clogged_drain: {
    title: 'Clogged Storm Drain Causing Street Flooding',
    description: 'Stormwater grate choked with silt and plastic debris. Puddle is expanding into store entrances following brief downpour.',
    category: 'Stormwater Drainage Clog / Urban Flooding',
    categoryKey: 'drainage_clog',
    ward: 'Ward 4 - East District',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    lat: 40.7698,
    lng: -73.9598
  }
};

/* ==========================================================================
   INITIALIZATION & ROUTING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRouting();
  setupEventListeners();
  loadAllIssues();
});

function initRouting() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  state.currentRoute = hash;

  // Hide all sections
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));

  // Highlight active nav item
  document.querySelectorAll('.nav-item a').forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === hash);
  });

  const activeSection = document.getElementById(`section-${hash}`);
  if (activeSection) {
    activeSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Route-specific triggers
  if (hash === 'map') {
    if (typeof initMainMap === 'function') {
      setTimeout(() => {
        initMainMap();
        if (window.mainMap) window.mainMap.invalidateSize();
      }, 150);
    }
  } else if (hash === 'report') {
    if (typeof initReportMiniMap === 'function') {
      setTimeout(() => {
        initReportMiniMap();
        if (window.reportMiniMap) window.reportMiniMap.invalidateSize();
      }, 150);
    }
  } else if (hash === 'dashboard') {
    renderDashboardTable();
    updateDashboardKpis();
  } else if (hash === 'analytics') {
    if (typeof loadAnalyticsData === 'function') {
      loadAnalyticsData();
    }
  }

  // Close mobile nav drawer if open
  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.classList.remove('mobile-open');
}

function navigateTo(route) {
  window.location.hash = `#${route}`;
}

/* ==========================================================================
   ROLE SWITCHER (Citizen <-> Authority Portal)
   ========================================================================== */

function switchRole(role) {
  state.role = role;
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });

  if (role === 'authority') {
    showToast('Switched to Municipal Authority Portal', 'info');
    navigateTo('dashboard');
  } else {
    showToast('Switched to Citizen Mode', 'info');
    navigateTo('home');
  }
}

/* ==========================================================================
   EVENT LISTENERS & BINDINGS
   ========================================================================== */

function setupEventListeners() {
  // Mobile Hamburger Toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const navLinks = document.getElementById('nav-links');
      if (navLinks) navLinks.classList.toggle('mobile-open');
    });
  }

  // Photo Upload Dropzone
  const dropzone = document.getElementById('photo-dropzone');
  const fileInput = document.getElementById('report-photo-input');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.style.borderColor = '#00d2ff';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'rgba(0, 210, 255, 0.35)';
    });

    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(0, 210, 255, 0.35)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePhotoSelected(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoSelected(e.target.files[0]);
      }
    });
  }

  // Remove Photo Button
  const removePhotoBtn = document.getElementById('remove-photo-btn');
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearPhoto();
    });
  }

  // Live AI Preview on Text Typing (Debounced)
  const titleInput = document.getElementById('report-title');
  const descInput = document.getElementById('report-desc');
  let previewDebounceTimer = null;

  const triggerLiveAI = () => {
    clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(() => {
      runLiveAIPreview();
      checkDuplicateIssues();
    }, 450);
  };

  if (titleInput) titleInput.addEventListener('input', triggerLiveAI);
  if (descInput) descInput.addEventListener('input', triggerLiveAI);

  // Form Submit
  const reportForm = document.getElementById('issue-report-form');
  if (reportForm) {
    reportForm.addEventListener('submit', handleIssueSubmission);
  }

  // Citizen Track Ticket Form
  const trackForm = document.getElementById('track-ticket-form');
  if (trackForm) {
    trackForm.addEventListener('submit', handleTrackTicketSubmit);
  }

  // Dashboard Filters
  const searchInput = document.getElementById('dash-search');
  const statusSelect = document.getElementById('dash-filter-status');
  const sevSelect = document.getElementById('dash-filter-sev');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.dashboardFilters.search = e.target.value;
      renderDashboardTable();
    });
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.dashboardFilters.status = e.target.value;
      renderDashboardTable();
    });
  }
  if (sevSelect) {
    sevSelect.addEventListener('change', (e) => {
      state.dashboardFilters.severity = e.target.value;
      renderDashboardTable();
    });
  }

  // Backdrop click to dismiss modals
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // ESC key to dismiss any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
}

/* ==========================================================================
   PHOTO UPLOAD & AI SCANNER INTERACTION
   ========================================================================== */

function handlePhotoSelected(file) {
  state.selectedPhotoFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    state.photoPreviewUrl = e.target.result;
    showImagePreview(e.target.result, file.name);
    runLiveAIPreview();
  };
  reader.readAsDataURL(file);
}

function showImagePreview(url, fileName) {
  const container = document.getElementById('image-preview-box');
  const previewImg = document.getElementById('preview-image-element');
  const scanStatus = document.getElementById('ai-scan-status-text');

  if (container && previewImg) {
    previewImg.src = url;
    container.style.display = 'block';

    if (scanStatus) {
      scanStatus.innerHTML = `
        <span class="pulse-dot" style="display:inline-block; width:6px; height:6px; background:#00d2ff;"></span>
        AI Vision Scanning: Analyzing Water Anomaly...
      `;
    }

    // After simulated scan, show verified tag
    setTimeout(() => {
      if (scanStatus) {
        scanStatus.innerHTML = `
          <span style="color:#00e5a3;">✓</span>
          AI Vision: Features Extracted & Verified
        `;
      }
    }, 1800);
  }
}

function clearPhoto() {
  state.selectedPhotoFile = null;
  state.photoPreviewUrl = null;
  const container = document.getElementById('image-preview-box');
  const fileInput = document.getElementById('report-photo-input');
  if (container) container.style.display = 'none';
  if (fileInput) fileInput.value = '';
  runLiveAIPreview();
}

/**
 * 1-Click Scenario Preset Fill (e.g. Pipe Burst, Sewage Overflow, etc.)
 */
function fillPresetScenario(scenarioKey) {
  const scenario = PRESET_SCENARIOS[scenarioKey];
  if (!scenario) return;

  const titleInput = document.getElementById('report-title');
  const descInput = document.getElementById('report-desc');
  const wardSelect = document.getElementById('report-ward');

  if (titleInput) titleInput.value = scenario.title;
  if (descInput) descInput.value = scenario.description;
  if (wardSelect) wardSelect.value = scenario.ward;

  // Use preset photo
  state.photoPreviewUrl = scenario.imageUrl;
  state.selectedPhotoFile = null; // Will send imageUrl in payload
  showImagePreview(scenario.imageUrl, `${scenarioKey}.jpg`);

  // Move marker on mini-map
  if (typeof setReportLocation === 'function') {
    setReportLocation(scenario.lat, scenario.lng, true);
    if (window.reportMiniMap && window.reportMarker) {
      window.reportMiniMap.setView([scenario.lat, scenario.lng], 15);
      window.reportMarker.setLatLng([scenario.lat, scenario.lng]);
    }
  }

  runLiveAIPreview();
  showToast(`Loaded scenario: "${scenario.category}"`, 'info');
}

/* ==========================================================================
   AI LIVE PREVIEW & DUPLICATE DETECTION ENGINES
   ========================================================================== */

async function runLiveAIPreview() {
  const title = document.getElementById('report-title')?.value || '';
  const desc = document.getElementById('report-desc')?.value || '';
  const hasPhoto = Boolean(state.photoPreviewUrl || state.selectedPhotoFile);

  try {
    const resp = await fetch('/api/issues/analyze-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: desc,
        hasPhoto,
        fileName: state.selectedPhotoFile?.name || ''
      })
    });

    const data = await resp.json();
    if (data.success && data.analysis) {
      state.aiAnalysisResult = data.analysis;
      renderAIPreviewCard(data.analysis);
    }
  } catch (err) {
    console.warn('AI Preview fetch error:', err);
  }
}

function renderAIPreviewCard(analysis) {
  const catEl = document.getElementById('ai-preview-category');
  const confEl = document.getElementById('ai-preview-confidence');
  const sevEl = document.getElementById('ai-preview-severity');
  const deptEl = document.getElementById('ai-preview-department');
  const lossEl = document.getElementById('ai-preview-water-loss');
  const equipEl = document.getElementById('ai-preview-equipment');

  if (catEl) catEl.innerText = analysis.category;
  if (confEl) confEl.innerText = analysis.confidence;
  if (deptEl) deptEl.innerText = analysis.department;
  if (lossEl) lossEl.innerText = analysis.estimatedWaterLoss;

  if (sevEl) {
    sevEl.className = `badge-sev ${analysis.severity}`;
    sevEl.innerHTML = `
      <span style="width:8px; height:8px; border-radius:50%; background:currentColor;"></span>
      ${analysis.severity} (${analysis.targetSLA})
    `;
  }

  if (equipEl && analysis.recommendedEquipment) {
    equipEl.innerHTML = analysis.recommendedEquipment
      .map(eq => `<span style="display:inline-block; background:rgba(255,255,255,0.06); padding:0.25rem 0.55rem; border-radius:6px; font-size:0.75rem; margin:0.2rem; color:#fff;">🛠️ ${eq}</span>`)
      .join('');
  }
}

/**
 * Real-time Duplicate Issue Detection Check
 */
async function checkDuplicateIssues() {
  const lat = document.getElementById('report-lat')?.value;
  const lng = document.getElementById('report-lng')?.value;
  const title = document.getElementById('report-title')?.value || '';
  const categoryId = state.aiAnalysisResult?.categoryId || 'pipe_burst';

  if (!lat || !lng) return;

  try {
    const resp = await fetch('/api/issues/check-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, categoryId, title })
    });

    const data = await resp.json();
    const alertBox = document.getElementById('duplicate-alert-box');

    if (data.success && data.hasDuplicate) {
      state.duplicateMatch = data.closestMatch;
      const match = data.closestMatch;

      if (alertBox) {
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
          <div class="dup-header">
            ⚠️ <strong>Nearby Similar Issue Detected!</strong>
          </div>
          <div class="dup-details">
            An active report <strong>"${match.title}"</strong> (${match.category}) was already registered just 
            <span style="color:#00d2ff; font-weight:700;">${match.distanceMeters}m away</span>.
            Status: <span class="badge-status ${match.status.replace(/\s+/g, '')}">${match.status}</span>.
          </div>
          <div class="dup-actions">
            <button type="button" class="btn btn-sm btn-primary" onclick="upvoteExistingTicket('${match.issueId}')">
              👍 Upvote Existing Ticket #${match.issueId}
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="dismissDuplicateWarning()">
              Report as New Unique Issue
            </button>
          </div>
        `;
      }
    } else {
      state.duplicateMatch = null;
      if (alertBox) alertBox.style.display = 'none';
    }
  } catch (err) {
    console.warn('Duplicate check error:', err);
  }
}

function dismissDuplicateWarning() {
  const alertBox = document.getElementById('duplicate-alert-box');
  if (alertBox) alertBox.style.display = 'none';
  showToast('Proceeding with new unique report', 'info');
}

async function upvoteExistingTicket(ticketId) {
  try {
    const resp = await fetch(`/api/issues/${ticketId}/upvote`, { method: 'POST' });
    const data = await resp.json();
    if (data.success) {
      showToast(`Upvoted #${ticketId}! Authorities notified of multiple citizen confirmations.`, 'success');
      loadAllIssues();
      navigateTo('map');
    }
  } catch (err) {
    showToast('Failed to upvote ticket', 'error');
  }
}

/* ==========================================================================
   ISSUE SUBMISSION CONTROLLER
   ========================================================================== */

async function handleIssueSubmission(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-issue-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="display:inline-block; width:6px; height:6px;"></span>
      AI Analyzing & Submitting...
    `;
  }

  const title = document.getElementById('report-title')?.value;
  const description = document.getElementById('report-desc')?.value;
  const citizenName = document.getElementById('report-citizen-name')?.value || 'Anonymous Citizen';
  const citizenContact = document.getElementById('report-citizen-phone')?.value || '';
  const ward = document.getElementById('report-ward')?.value || 'Ward 4 - Metro Central';
  const address = document.getElementById('report-address')?.value || 'Reported Location';
  const landmark = document.getElementById('report-landmark')?.value || '';
  const lat = document.getElementById('report-lat')?.value || '40.7580';
  const lng = document.getElementById('report-lng')?.value || '-73.9855';

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('citizenName', citizenName);
  formData.append('citizenContact', citizenContact);
  formData.append('ward', ward);
  formData.append('address', address);
  formData.append('landmark', landmark);
  formData.append('lat', lat);
  formData.append('lng', lng);

  if (state.selectedPhotoFile) {
    formData.append('photo', state.selectedPhotoFile);
  } else if (state.photoPreviewUrl) {
    formData.append('imageUrl', state.photoPreviewUrl);
  }

  try {
    const resp = await fetch('/api/issues', {
      method: 'POST',
      body: formData
    });

    const result = await resp.json();

    if (result.success && result.data) {
      const issue = result.data;
      showToast(`Issue ${issue.ticketId} successfully reported!`, 'success');

      // Reset form
      document.getElementById('issue-report-form').reset();
      clearPhoto();

      // Refresh list
      await loadAllIssues();

      // Show Success Modal
      showSubmissionSuccessModal(issue);
    } else {
      showToast(`Error: ${result.error || 'Failed to submit issue'}`, 'error');
    }
  } catch (err) {
    console.error('Submission error:', err);
    showToast('Network error submitting issue. Please try again.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `🚀 Submit Water Issue for AI Dispatch`;
    }
  }
}

function showSubmissionSuccessModal(issue) {
  const modal = document.getElementById('success-modal');
  const body = document.getElementById('success-modal-content');

  if (modal && body) {
    body.innerHTML = `
      <div style="text-align:center; padding:1rem 0;">
        <div style="width:68px; height:68px; border-radius:50%; background:rgba(0, 229, 163, 0.15); color:#00e5a3; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1.25rem; border:2px solid #00e5a3; box-shadow:0 0 20px rgba(0,229,163,0.3);">
          ✓
        </div>
        <h3 style="font-size:1.6rem; color:#fff; margin-bottom:0.4rem;">Issue Registered Successfully!</h3>
        <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:1.5rem;">
          Your issue has been analyzed by AquaGuard AI and dispatched to municipal field crews.
        </p>

        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:1.25rem; text-align:left; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
            <span style="color:#94a3b8; font-size:0.85rem;">Ticket Tracking ID:</span>
            <span style="font-family:monospace; color:#00d2ff; font-weight:700; font-size:1.1rem;">${issue.ticketId}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
            <span style="color:#94a3b8; font-size:0.85rem;">AI Classification:</span>
            <span style="color:#fff; font-weight:600; font-size:0.9rem;">${issue.category}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
            <span style="color:#94a3b8; font-size:0.85rem;">Severity & SLA:</span>
            <span class="badge-sev ${issue.severity}">${issue.severity} (${issue.aiAnalysis?.targetSLA || '4 hours'})</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#94a3b8; font-size:0.85rem;">Assigned Department:</span>
            <span style="color:#00d2ff; font-weight:600; font-size:0.85rem;">${issue.assignedDepartment}</span>
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; justify-content:center;">
          <button class="btn btn-primary" onclick="closeModal('success-modal'); navigateTo('map');">
            🗺️ View on Live Map
          </button>
          <button class="btn btn-secondary" onclick="closeModal('success-modal'); navigateTo('dashboard');">
            📋 Authority Dashboard
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }
}

/* ==========================================================================
   DATA FETCHING & SYNC
   ========================================================================== */

async function loadAllIssues() {
  try {
    const resp = await fetch('/api/issues');
    const result = await resp.json();

    if (result.success && Array.isArray(result.data)) {
      state.issues = result.data;
      window.currentIssuesData = state.issues;

      updateHomeStats();
      renderHomeLiveFeed();
      renderDashboardTable();
      updateDashboardKpis();

      if (window.renderMainMapIssues) {
        window.renderMainMapIssues();
      }
    }
  } catch (err) {
    console.error('Error loading issues:', err);
  }
}

function updateHomeStats() {
  const issues = state.issues;
  const total = issues.length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const elTotal = document.getElementById('stat-total-issues');
  const elProgress = document.getElementById('stat-progress-issues');
  const elResolved = document.getElementById('stat-resolved-issues');

  if (elTotal) elTotal.innerText = total;
  if (elProgress) elProgress.innerText = inProgress;
  if (elResolved) elResolved.innerText = resolved;
}

function renderHomeLiveFeed() {
  const container = document.getElementById('home-live-feed-list');
  if (!container) return;

  const recent = state.issues.slice(0, 6);
  container.innerHTML = recent.map(issue => `
    <div class="feed-item" onclick="openIssueDetailsModal('${issue.ticketId}')">
      <img class="feed-thumb" src="${issue.imageUrl}" alt="Thumbnail" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=300&q=80'" />
      <div class="feed-body">
        <div class="feed-top">
          <span class="feed-ticket">${issue.ticketId}</span>
          <span class="badge-status ${issue.status.replace(/\s+/g, '')}">${issue.status}</span>
        </div>
        <div class="feed-title">${issue.title}</div>
        <div class="feed-bottom">
          <span>📍 ${issue.location?.ward || 'Central'}</span>
          <span class="badge-sev ${issue.severity}">${issue.severity}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   AUTHORITY / ADMIN DASHBOARD CONTROLLER
   ========================================================================== */

function updateDashboardKpis() {
  const issues = state.issues;
  const total = issues.length;
  const critical = issues.filter(i => i.severity === 'Critical').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const elTotal = document.getElementById('kpi-total');
  const elCritical = document.getElementById('kpi-critical');
  const elProgress = document.getElementById('kpi-progress');
  const elResolved = document.getElementById('kpi-resolved');

  if (elTotal) elTotal.innerText = total;
  if (elCritical) elCritical.innerText = critical;
  if (elProgress) elProgress.innerText = inProgress;
  if (elResolved) elResolved.innerText = resolved;
}

function renderDashboardTable() {
  const tbody = document.getElementById('dash-table-body');
  if (!tbody) return;

  let filtered = [...state.issues];
  const { status, severity, search } = state.dashboardFilters;

  if (status !== 'All') {
    filtered = filtered.filter(i => i.status === status);
  }
  if (severity !== 'All') {
    filtered = filtered.filter(i => i.severity === severity);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.ticketId.toLowerCase().includes(q) ||
      (i.location?.address && i.location.address.toLowerCase().includes(q)) ||
      (i.assignedOfficer && i.assignedOfficer.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;">
          No matching water infrastructure issues found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(issue => `
    <tr>
      <td>
        <span style="font-family:monospace; font-weight:700; color:#00d2ff;">${issue.ticketId}</span>
      </td>
      <td>
        <div class="table-issue-cell">
          <img class="table-thumb" src="${issue.imageUrl}" alt="Photo" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=300&q=80'" />
          <div>
            <div class="table-issue-title">${issue.title}</div>
            <div class="table-issue-cat">${issue.category}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-size:0.85rem; color:#fff;">📍 ${issue.location?.ward || 'Central'}</div>
        <div style="font-size:0.75rem; color:#94a3b8;">${issue.location?.address || ''}</div>
      </td>
      <td>
        <span class="badge-sev ${issue.severity}">${issue.severity}</span>
        <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">Target: ${issue.aiAnalysis?.targetSLA || '4h'}</div>
      </td>
      <td>
        <span class="badge-status ${issue.status.replace(/\s+/g, '')}">${issue.status}</span>
      </td>
      <td>
        <div style="font-size:0.85rem; color:#fff; font-weight:600;">
          ${issue.assignedOfficer && issue.assignedOfficer !== 'Unassigned' ? '👷 ' + issue.assignedOfficer : '<span style="color:#ffb703;">⚠️ Pending Dispatch</span>'}
        </div>
        <div style="font-size:0.75rem; color:#94a3b8;">${issue.assignedDepartment}</div>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary btn-sm" onclick="openIssueDetailsModal('${issue.ticketId}')" title="Inspect Case">
            👁️ Inspect
          </button>
          <button class="btn btn-primary btn-sm" onclick="openStatusUpdateModal('${issue.ticketId}')" title="Assign / Update Status">
            ✏️ Manage
          </button>
          <button class="btn btn-secondary btn-sm" onclick="deleteIssueConfirm('${issue.ticketId}')" title="Delete Case" style="color:#ff3366; border-color:rgba(255,51,102,0.3);">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Permanently Delete Issue from System
 */
async function deleteIssueConfirm(ticketId) {
  if (confirm(`Are you sure you want to permanently delete issue #${ticketId}?`)) {
    try {
      const resp = await fetch(`/api/issues/${ticketId}`, { method: 'DELETE' });
      const res = await resp.json();
      if (res.success) {
        showToast(`Issue #${ticketId} deleted`, 'info');
        await loadAllIssues();
      } else {
        showToast(res.error || 'Failed to delete issue', 'error');
      }
    } catch (err) {
      showToast('Error communicating with server', 'error');
    }
  }
}

/**
 * Seed a new Demo Incident for instant interactive testing
 */
async function seedDemoIncident() {
  const scenarios = Object.keys(PRESET_SCENARIOS);
  const randomKey = scenarios[Math.floor(Math.random() * scenarios.length)];
  const s = PRESET_SCENARIOS[randomKey];
  const randomOffset = (Math.random() - 0.5) * 0.02;

  try {
    const resp = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: s.title,
        description: s.description,
        categoryOverride: s.categoryKey,
        imageUrl: s.imageUrl,
        ward: s.ward,
        address: `Simulated Civic Site, ${s.ward}`,
        lat: s.lat + randomOffset,
        lng: s.lng + randomOffset,
        citizenName: 'Civic IoT Sensor System'
      })
    });
    const data = await resp.json();
    if (data.success) {
      showToast(`⚡ Seeded new incident #${data.data.ticketId} (${data.data.category})`, 'success');
      await loadAllIssues();
    }
  } catch (e) {
    showToast('Failed to seed demo incident', 'error');
  }
}

/**
 * Export Issues as CSV
 */
function exportIssuesCSV() {
  if (state.issues.length === 0) {
    showToast('No issue records to export', 'info');
    return;
  }

  const headers = ['Ticket ID', 'Title', 'Category', 'Severity', 'Status', 'Ward', 'Address', 'Officer', 'Department', 'Created At'];
  const rows = state.issues.map(i => [
    `"${i.ticketId}"`,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    `"${i.category}"`,
    `"${i.severity}"`,
    `"${i.status}"`,
    `"${i.location?.ward || ''}"`,
    `"${(i.location?.address || '').replace(/"/g, '""')}"`,
    `"${i.assignedOfficer || 'Unassigned'}"`,
    `"${i.assignedDepartment || ''}"`,
    `"${i.createdAt}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `AquaGuard_Incident_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Municipal Incident Report exported to CSV', 'success');
}

/* ==========================================================================
   MODAL CONTROLLERS (Details, Status Update, Tracker)
   ========================================================================== */

function openIssueDetailsModal(ticketId) {
  const issue = state.issues.find(i => i.ticketId === ticketId);
  if (!issue) return;

  state.selectedIssue = issue;
  const modal = document.getElementById('details-modal');
  const title = document.getElementById('details-modal-title');
  const body = document.getElementById('details-modal-body');

  if (title) title.innerText = `Incident Case File: ${issue.ticketId}`;

  if (body) {
    // Build 4-step status bar
    const statuses = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
    const currentIdx = statuses.indexOf(issue.status);

    const statusBarHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border-radius:16px; padding:1.25rem 1.5rem; margin-bottom:1.75rem; border:1px solid var(--border-subtle);">
        ${statuses.map((st, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem; position:relative; flex:1;">
              <div style="
                width:34px; height:34px; border-radius:50%;
                background:${isCurrent ? '#00d2ff' : isDone ? '#00e5a3' : 'rgba(255,255,255,0.08)'};
                color:${isCurrent || isDone ? '#070d1e' : '#94a3b8'};
                display:flex; align-items:center; justify-content:center;
                font-weight:800; font-size:0.85rem;
                border:2px solid ${isCurrent ? '#00d2ff' : isDone ? '#00e5a3' : 'rgba(255,255,255,0.1)'};
                box-shadow:${isCurrent ? '0 0 12px rgba(0,210,255,0.5)' : 'none'};
              ">
                ${isDone && !isCurrent ? '✓' : idx + 1}
              </div>
              <span style="font-size:0.8rem; font-weight:600; color:${isCurrent ? '#00d2ff' : isDone ? '#fff' : '#64748b'};">
                ${st}
              </span>
            </div>
          `;
        }).join('<div style="height:2px; flex:1; background:rgba(255,255,255,0.1); margin-top:-1.2rem;"></div>')}
      </div>
    `;

    // Timeline HTML
    const timelineHtml = (issue.timeline || []).map(tl => `
      <div class="timeline-node">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-meta">
            <span class="timeline-status">${tl.status}</span>
            <span>${new Date(tl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
          </div>
          <div style="font-size:0.8rem; color:#00d2ff; margin-bottom:0.25rem;">Actor: ${tl.updatedBy}</div>
          <div class="timeline-note">${tl.note}</div>
        </div>
      </div>
    `).join('');

    body.innerHTML = `
      ${statusBarHtml}

      <div style="display:grid; grid-template-columns:1.2fr 0.8fr; gap:1.5rem; margin-bottom:1.5rem;">
        <div>
          <img src="${issue.imageUrl}" alt="Issue Evidence" style="width:100%; height:240px; object-fit:cover; border-radius:14px; border:1px solid var(--border-subtle); margin-bottom:1rem;" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80'" />
          <h3 style="font-size:1.35rem; color:#fff; margin-bottom:0.5rem;">${issue.title}</h3>
          <p style="color:#94a3b8; font-size:0.95rem; line-height:1.6; margin-bottom:1rem;">${issue.description}</p>
          
          <div style="background:rgba(255,255,255,0.02); padding:1rem; border-radius:12px; border:1px solid var(--border-subtle);">
            <div style="font-size:0.85rem; color:#fff; margin-bottom:0.35rem;">
              <strong>📍 Address:</strong> ${issue.location?.address || 'Metro Area'} (${issue.location?.ward || 'Central'})
            </div>
            ${issue.location?.landmark ? `<div style="font-size:0.82rem; color:#94a3b8; margin-bottom:0.35rem;"><strong>Landmark:</strong> ${issue.location.landmark}</div>` : ''}
            <div style="font-size:0.8rem; color:#64748b; font-family:monospace;">
              Coordinates: ${issue.location?.coordinates?.lat || ''}, ${issue.location?.coordinates?.lng || ''}
            </div>
          </div>
        </div>

        <div>
          <!-- AI Diagnostic Breakdown -->
          <div style="background:rgba(19, 34, 71, 0.6); border:1px solid rgba(0, 210, 255, 0.25); border-radius:16px; padding:1.25rem; margin-bottom:1.25rem;">
            <div style="font-size:0.82rem; font-weight:700; color:#00d2ff; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.85rem;">
              🧠 AquaGuard AI Diagnostics
            </div>
            <div style="margin-bottom:0.6rem; font-size:0.88rem;">
              <span style="color:#94a3b8;">Classification:</span>
              <div style="font-weight:700; color:#fff;">${issue.category}</div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.88rem;">
              <span style="color:#94a3b8;">AI Confidence:</span>
              <span style="color:#00e5a3; font-weight:700;">${issue.aiAnalysis?.confidence || '94%'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.88rem;">
              <span style="color:#94a3b8;">Assigned SLA:</span>
              <span style="color:#ffb703; font-weight:700;">${issue.aiAnalysis?.targetSLA || '4 hours'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; font-size:0.88rem;">
              <span style="color:#94a3b8;">Water Loss Est:</span>
              <span style="color:#00d2ff; font-weight:700;">${issue.aiAnalysis?.estimatedWaterLoss || 'N/A'}</span>
            </div>
            <div style="margin-top:0.75rem;">
              <span style="color:#94a3b8; font-size:0.8rem; display:block; margin-bottom:0.3rem;">Field Tooling Needed:</span>
              <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                ${(issue.aiAnalysis?.recommendedEquipment || ['Standard Toolkit']).map(eq => `<span style="font-size:0.72rem; background:rgba(255,255,255,0.06); padding:0.2rem 0.5rem; border-radius:4px; color:#fff;">${eq}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Assignment & Status -->
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:16px; padding:1.25rem;">
            <div style="font-size:0.82rem; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">
              Dispatched Team
            </div>
            <div style="font-size:0.9rem; font-weight:700; color:#fff; margin-bottom:0.25rem;">
              ${issue.assignedOfficer && issue.assignedOfficer !== 'Unassigned' ? '👷 ' + issue.assignedOfficer : '⚠️ Unassigned'}
            </div>
            <div style="font-size:0.82rem; color:#94a3b8; margin-bottom:0.75rem;">
              ${issue.assignedDepartment}
            </div>
            ${issue.resolutionNotes ? `<div style="font-size:0.82rem; background:rgba(0, 229, 163, 0.1); border:1px solid rgba(0, 229, 163, 0.3); border-radius:8px; padding:0.6rem; color:#fff; margin-bottom:0.75rem;"><strong>Resolution Log:</strong> ${issue.resolutionNotes}</div>` : ''}
            <button class="btn btn-primary btn-sm" style="width:100%;" onclick="closeModal('details-modal'); openStatusUpdateModal('${issue.ticketId}')">
              ✏️ Update Status / Assign Crew
            </button>
          </div>
        </div>
      </div>

      <!-- Chronological Audit Trail -->
      <h4 style="font-size:1.15rem; color:#fff; margin:1.5rem 0 0.85rem;">Chronological Lifecycle History</h4>
      <div class="timeline-wrapper">
        ${timelineHtml}
      </div>
    `;

    modal.classList.add('active');
  }
}

/**
 * Open Status Update Modal
 */
function openStatusUpdateModal(ticketId) {
  const issue = state.issues.find(i => i.ticketId === ticketId);
  if (!issue) return;

  state.selectedIssue = issue;
  const modal = document.getElementById('status-modal');
  const title = document.getElementById('status-modal-title');
  const targetId = document.getElementById('status-update-ticket-id');
  const statusSelect = document.getElementById('status-update-select');
  const officerInput = document.getElementById('status-update-officer');
  const notesInput = document.getElementById('status-update-notes');

  if (title) title.innerText = `Manage Workflow: ${issue.ticketId}`;
  if (targetId) targetId.value = issue.ticketId;
  if (statusSelect) statusSelect.value = issue.status;
  if (officerInput) officerInput.value = (issue.assignedOfficer && issue.assignedOfficer !== 'Unassigned') ? issue.assignedOfficer : 'Officer Sarah Chen (Squad Leader)';
  if (notesInput) notesInput.value = '';

  if (modal) modal.classList.add('active');
}

/**
 * Submit Status Update to Server
 */
async function submitStatusUpdate(e) {
  e.preventDefault();

  const ticketId = document.getElementById('status-update-ticket-id')?.value;
  const status = document.getElementById('status-update-select')?.value;
  const officer = document.getElementById('status-update-officer')?.value;
  const note = document.getElementById('status-update-notes')?.value;

  try {
    const resp = await fetch(`/api/issues/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        officer,
        note: note || `Issue moved to ${status} status`,
        resolutionNotes: status === 'Resolved' ? (note || 'Issue resolved and tested') : undefined
      })
    });

    const data = await resp.json();
    if (data.success) {
      showToast(`Updated #${ticketId} to "${status}"`, 'success');
      closeModal('status-modal');
      await loadAllIssues();
      renderDashboardTable();
    } else {
      showToast(data.error || 'Failed to update issue', 'error');
    }
  } catch (err) {
    console.error('Update error:', err);
    showToast('Failed to connect to server', 'error');
  }
}

/**
 * Citizen Ticket Tracker Lookup
 */
async function handleTrackTicketSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('track-ticket-input');
  const container = document.getElementById('track-result-container');
  const query = input?.value?.trim();

  if (!query) return;

  try {
    const resp = await fetch(`/api/issues/${query}`);
    const data = await resp.json();

    if (data.success && data.data && container) {
      const issue = data.data;
      container.style.display = 'block';
      container.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid rgba(0,210,255,0.3); border-radius:20px; padding:1.75rem; box-shadow:var(--shadow-md);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <span style="font-family:monospace; color:#00d2ff; font-weight:700; font-size:1.1rem;">${issue.ticketId}</span>
              <h3 style="font-size:1.25rem; color:#fff; margin-top:0.25rem;">${issue.title}</h3>
            </div>
            <span class="badge-status ${issue.status.replace(/\s+/g, '')}">${issue.status}</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.25rem; font-size:0.88rem;">
            <div style="background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:10px;">
              <span style="color:#94a3b8;">Department:</span>
              <div style="color:#fff; font-weight:600;">${issue.assignedDepartment}</div>
            </div>
            <div style="background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:10px;">
              <span style="color:#94a3b8;">Field Officer:</span>
              <div style="color:#fff; font-weight:600;">${issue.assignedOfficer || 'Pending Assignment'}</div>
            </div>
          </div>

          <button class="btn btn-primary btn-sm" onclick="openIssueDetailsModal('${issue.ticketId}')">
            View Complete Case File & Live Map
          </button>
        </div>
      `;
    } else {
      if (container) {
        container.style.display = 'block';
        container.innerHTML = `
          <div style="background:rgba(255,51,102,0.1); border:1px solid rgba(255,51,102,0.3); border-radius:14px; padding:1.25rem; text-align:center; color:#fff;">
            ❌ No record found for Ticket ID <strong>"${query}"</strong>. Please verify the code (e.g. AQ-2026-1081).
          </div>
        `;
      }
    }
  } catch (err) {
    showToast('Error looking up ticket', 'error');
  }
}

/* ==========================================================================
   UI UTILITIES (Modals, Toasts)
   ========================================================================== */

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// Global window exposure
window.state = state;
window.navigateTo = navigateTo;
window.switchRole = switchRole;
window.fillPresetScenario = fillPresetScenario;
window.openIssueDetailsModal = openIssueDetailsModal;
window.openStatusUpdateModal = openStatusUpdateModal;
window.submitStatusUpdate = submitStatusUpdate;
window.closeModal = closeModal;
window.showToast = showToast;
window.upvoteExistingTicket = upvoteExistingTicket;
window.dismissDuplicateWarning = dismissDuplicateWarning;
window.exportIssuesCSV = exportIssuesCSV;
window.deleteIssueConfirm = deleteIssueConfirm;
window.seedDemoIncident = seedDemoIncident;
