/**
 * AquaGuard AI - Interactive Geospatial Mapping Module
 * Powered by Leaflet.js with custom water hazard markers,
 * hotspot radius circles, and dynamic location picker.
 */

let mainMap = null;
let reportMiniMap = null;
let reportMarker = null;
let issueMarkersLayer = null;
let hotspotCirclesLayer = null;
let currentIssuesData = [];
let currentStatusFilter = 'All';
let currentCategoryFilter = 'All';
let showHotspots = true;

// Default Center Coordinates (Metro Central)
const DEFAULT_COORDS = [40.7580, -73.9855]; // New York Metro area
const DEFAULT_ZOOM = 13;

/**
 * Custom SVG Marker generator based on severity and status
 */
function createCustomPin(severity, status) {
  let color = '#ffb703';
  let pulseClass = '';

  if (status === 'Resolved') {
    color = '#10b981';
  } else if (severity === 'Critical') {
    color = '#ff3366';
    pulseClass = 'critical-pulse';
  } else if (severity === 'High') {
    color = '#ff7d00';
  } else if (severity === 'Medium') {
    color = '#ffb703';
  } else {
    color = '#00e5a3';
  }

  const html = `
    <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
      <div style="
        position:absolute;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px ${color}88;
        border: 2px solid #ffffff;
      "></div>
      <div style="
        position:relative;
        z-index:2;
        width:12px;
        height:12px;
        border-radius:50%;
        background:#ffffff;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'aquaguard-custom-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  });
}

/**
 * Initialize the Main Interactive Map
 */
function initMainMap() {
  const container = document.getElementById('main-interactive-map');
  if (!container || mainMap) return;

  mainMap = L.map('main-interactive-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(DEFAULT_COORDS, DEFAULT_ZOOM);

  window.mainMap = mainMap;

  // Modern CartoDB Dark Matter / Voyager Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(mainMap);

  issueMarkersLayer = L.layerGroup().addTo(mainMap);
  hotspotCirclesLayer = L.layerGroup().addTo(mainMap);

  // Initial load of markers
  renderMainMapIssues();
}

/**
 * Render issues on main map with filters & hotspot circles
 */
function renderMainMapIssues() {
  if (!mainMap || !issueMarkersLayer) return;

  issueMarkersLayer.clearLayers();
  hotspotCirclesLayer.clearLayers();

  let filtered = currentIssuesData;

  if (currentStatusFilter !== 'All') {
    filtered = filtered.filter(i => i.status === currentStatusFilter);
  }
  if (currentCategoryFilter !== 'All') {
    filtered = filtered.filter(i => (i.categoryId === currentCategoryFilter || i.category === currentCategoryFilter));
  }

  const hotspotMap = {};

  filtered.forEach(issue => {
    const lat = parseFloat(issue.location?.coordinates?.lat || issue.lat);
    const lng = parseFloat(issue.location?.coordinates?.lng || issue.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    // Track active issues for hotspots
    if (issue.status !== 'Resolved') {
      const wardKey = issue.location?.ward || 'General Zone';
      if (!hotspotMap[wardKey]) {
        hotspotMap[wardKey] = { lat, lng, count: 0, ward: wardKey };
      }
      hotspotMap[wardKey].count++;
    }

    const pinIcon = createCustomPin(issue.severity, issue.status);
    const marker = L.marker([lat, lng], { icon: pinIcon });

    const photoUrl = issue.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80';

    const popupHtml = `
      <div class="popup-card">
        <img class="popup-thumb" src="${photoUrl}" alt="Issue photo" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80'" />
        <div style="padding-top:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
            <span style="font-family:monospace; font-size:0.75rem; color:#00d2ff; font-weight:700;">${issue.ticketId}</span>
            <span class="badge-status ${issue.status.replace(/\s+/g, '')}">${issue.status}</span>
          </div>
          <h4 class="popup-title">${issue.title}</h4>
          <p class="popup-meta">📍 ${issue.location?.address || 'Metro Area'} (${issue.location?.ward || 'Central'})</p>
          
          <div style="display:flex; gap:0.4rem; margin-bottom:0.75rem;">
            <span class="badge-sev ${issue.severity}">${issue.severity} Priority</span>
            ${issue.upvotes > 1 ? `<span style="font-size:0.75rem; background:rgba(255,255,255,0.08); padding:0.2rem 0.5rem; border-radius:10px; color:#fff;">👍 ${issue.upvotes} confirmations</span>` : ''}
          </div>

          <div class="popup-actions">
            <button class="btn btn-primary btn-sm" onclick="openIssueDetailsModal('${issue.ticketId}')" style="flex:1;">
              View Details
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openStatusUpdateModal('${issue.ticketId}')">
              Update
            </button>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { maxWidth: 300 });
    issueMarkersLayer.addLayer(marker);
  });

  // Render Hotspot Danger Circles
  if (showHotspots) {
    Object.values(hotspotMap).forEach(hs => {
      if (hs.count >= 2) {
        const radius = Math.min(600, 250 + (hs.count * 80));
        const color = hs.count >= 3 ? '#ff3366' : '#ff7d00';
        
        const circle = L.circle([hs.lat, hs.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          radius: radius,
          weight: 2,
          dashArray: '4, 8'
        });

        circle.bindTooltip(`🚨 <strong>${hs.ward} Hotspot</strong><br>${hs.count} Active Incidents in Zone`, {
          permanent: false,
          direction: 'top'
        });

        hotspotCirclesLayer.addLayer(circle);
      }
    });
  }
}

/**
 * Filter map by status
 */
function setMapStatusFilter(status) {
  currentStatusFilter = status;
  document.querySelectorAll('.map-status-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  renderMainMapIssues();
}

/**
 * Filter map by category
 */
function setMapCategoryFilter(catId) {
  currentCategoryFilter = catId;
  document.querySelectorAll('.map-cat-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === catId);
  });
  renderMainMapIssues();
}

/**
 * Toggle Hotspots
 */
function toggleHotspotOverlay() {
  showHotspots = !showHotspots;
  const toggleBtn = document.getElementById('toggle-hotspots-btn');
  if (toggleBtn) {
    toggleBtn.classList.toggle('active', showHotspots);
    toggleBtn.innerText = showHotspots ? '🔥 Hotspots: ON' : '🔥 Hotspots: OFF';
  }
  renderMainMapIssues();
}

/**
 * Initialize Mini Map for Location Picker in Reporting Form
 */
function initReportMiniMap() {
  const container = document.getElementById('report-map-picker');
  if (!container || reportMiniMap) return;

  reportMiniMap = L.map('report-map-picker', {
    zoomControl: false,
    attributionControl: false
  }).setView(DEFAULT_COORDS, 14);

  window.reportMiniMap = reportMiniMap;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(reportMiniMap);

  // Custom draggable report marker
  const pinIcon = L.divIcon({
    html: `
      <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
        <div style="
          position:absolute;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: #00d2ff;
          transform: rotate(-45deg);
          box-shadow: 0 0 16px rgba(0, 210, 255, 0.8);
          border: 2px solid #ffffff;
        "></div>
        <div style="
          position:relative;
          z-index:2;
          width:12px;
          height:12px;
          border-radius:50%;
          background:#ffffff;
        "></div>
      </div>
    `,
    className: 'report-picker-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 34]
  });

  reportMarker = L.marker(DEFAULT_COORDS, {
    draggable: true,
    icon: pinIcon
  }).addTo(reportMiniMap);

  window.reportMarker = reportMarker;

  // Update on pin drag
  reportMarker.on('dragend', function (e) {
    const latLng = e.target.getLatLng();
    setReportLocation(latLng.lat, latLng.lng);
  });

  // Update on map click
  reportMiniMap.on('click', function (e) {
    reportMarker.setLatLng(e.latlng);
    setReportLocation(e.latlng.lat, e.latlng.lng);
  });

  // Set initial default coords
  setReportLocation(DEFAULT_COORDS[0], DEFAULT_COORDS[1], false);
}

/**
 * Update Location fields and run duplicate check
 */
async function setReportLocation(lat, lng, triggerDuplicateCheck = true) {
  const latInput = document.getElementById('report-lat');
  const lngInput = document.getElementById('report-lng');
  const coordsLabel = document.getElementById('coords-display-text');
  const addressInput = document.getElementById('report-address');

  if (latInput) latInput.value = lat.toFixed(6);
  if (lngInput) lngInput.value = lng.toFixed(6);
  if (coordsLabel) {
    coordsLabel.innerText = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)} (±5m)`;
  }

  // Reverse geocoding lookup
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.display_name && addressInput && (!addressInput.value || addressInput.dataset.autoFilled === 'true')) {
        const parts = data.display_name.split(', ');
        const shortAddr = parts.slice(0, 3).join(', ');
        addressInput.value = shortAddr;
        addressInput.dataset.autoFilled = 'true';
      }
    }
  } catch (e) {
    // Graceful fallback to default street estimation
    if (addressInput && !addressInput.value) {
      addressInput.value = `Near Metro Sector, Lat ${lat.toFixed(3)}`;
    }
  }

  if (triggerDuplicateCheck && typeof checkDuplicateIssues === 'function') {
    checkDuplicateIssues();
  }
}

/**
 * Use browser HTML5 Geolocation API
 */
function detectCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser', 'error');
    return;
  }

  const btn = document.getElementById('auto-gps-btn');
  if (btn) btn.innerHTML = '🛰️ Detecting GPS...';

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (reportMiniMap && reportMarker) {
        reportMiniMap.setView([lat, lng], 15);
        reportMarker.setLatLng([lat, lng]);
      }
      setReportLocation(lat, lng, true);
      showToast('📍 High-accuracy GPS location detected!', 'success');
      if (btn) btn.innerHTML = '📍 Use My Current GPS Location';
    },
    err => {
      console.warn('Geolocation error:', err);
      showToast('Could not fetch exact GPS. You can click on the map to place the pin.', 'info');
      if (btn) btn.innerHTML = '📍 Use My Current GPS Location';
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// Export to window
window.initMainMap = initMainMap;
window.renderMainMapIssues = renderMainMapIssues;
window.setMapStatusFilter = setMapStatusFilter;
window.setMapCategoryFilter = setMapCategoryFilter;
window.toggleHotspotOverlay = toggleHotspotOverlay;
window.initReportMiniMap = initReportMiniMap;
window.detectCurrentLocation = detectCurrentLocation;
window.setReportLocation = setReportLocation;
