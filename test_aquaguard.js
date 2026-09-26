/**
 * AquaGuard AI - Automated End-to-End Test Suite
 * Verifies all modules: Home, Reporting, Photo Upload, Location,
 * AI Classification, Severity, Dashboard, Status Transitions, Map, and Analytics.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, data = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 AQUAGUARD AI - COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Server Health & Home Page Delivery
    console.log('--- TEST 1: Server Health & Home Page ---');
    const health = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.data.status === 'ONLINE', 'Server reports ONLINE status');

    const homeHtml = await request({ hostname: '127.0.0.1', port: 3000, path: '/', method: 'GET' });
    assert(homeHtml.status === 200, 'Home page HTML served with HTTP 200');
    assert(homeHtml.raw.includes('AquaGuard AI') && homeHtml.raw.includes('section-home'), 'Home page contains AquaGuard AI markup and sections');

    // TEST 2: Static Asset Delivery (CSS & JS)
    console.log('\n--- TEST 2: Static Assets Delivery ---');
    const css = await request({ hostname: '127.0.0.1', port: 3000, path: '/css/style.css', method: 'GET' });
    assert(css.status === 200 && css.raw.includes('--bg-dark'), 'CSS stylesheet loaded correctly');

    const appJs = await request({ hostname: '127.0.0.1', port: 3000, path: '/js/app.js', method: 'GET' });
    assert(appJs.status === 200 && appJs.raw.includes('fillPresetScenario'), 'app.js loaded with scenario presets');

    const mapJs = await request({ hostname: '127.0.0.1', port: 3000, path: '/js/map.js', method: 'GET' });
    assert(mapJs.status === 200 && mapJs.raw.includes('initMainMap'), 'map.js loaded with Leaflet logic');

    const analyticsJs = await request({ hostname: '127.0.0.1', port: 3000, path: '/js/analytics.js', method: 'GET' });
    assert(analyticsJs.status === 200 && analyticsJs.raw.includes('loadAnalyticsData'), 'analytics.js loaded with Chart.js controllers');

    // TEST 3: AI Real-Time Preview Classification & Severity
    console.log('\n--- TEST 3: AI Classification & Severity Engine ---');
    const previewPayload = JSON.stringify({
      title: 'Massive Pipeline Rupture Gushing Over Highway',
      description: 'Underground high pressure pipe blown open, torrent flooding roadway',
      hasPhoto: true
    });
    const preview = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/issues/analyze-preview',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(previewPayload) }
    }, previewPayload);

    assert(preview.status === 200, 'AI analyze-preview endpoint returned 200');
    assert(preview.data.analysis.categoryId === 'pipe_burst', 'AI correctly categorized as pipe_burst');
    assert(preview.data.analysis.severity === 'Critical', 'AI correctly detected Critical severity');
    assert(preview.data.analysis.department === 'Water Supply & Main Pipelines', 'AI correctly assigned routing department');
    assert(Array.isArray(preview.data.analysis.recommendedEquipment) && preview.data.analysis.recommendedEquipment.length > 0, 'AI recommended field equipment tooling');

    // TEST 4: Geospatial Duplicate Detection
    console.log('\n--- TEST 4: Geospatial Duplicate Detection ---');
    const dupPayload = JSON.stringify({
      lat: 40.7628,
      lng: -73.9744,
      categoryId: 'pipe_burst',
      title: 'Water leaking on 5th Ave'
    });
    const dupResult = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/issues/check-duplicate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dupPayload) }
    }, dupPayload);

    assert(dupResult.status === 200, 'Duplicate check endpoint returned 200');
    assert(dupResult.data.hasDuplicate === true, 'Duplicate check successfully flagged existing nearby incident');
    assert(dupResult.data.closestMatch && dupResult.data.closestMatch.distanceMeters <= 50, 'Duplicate check calculated accurate distance <= 50m');

    // TEST 5: Multipart Photo Upload & Issue Creation
    console.log('\n--- TEST 5: Photo Upload & Issue Creation ---');
    const boundary = '----AquaGuardBoundary' + Date.now();
    const fakePhotoData = Buffer.from('FAKE_IMAGE_DATA_AQUAGUARD_TEST_OCTET_STREAM');

    let multipartBody = '';
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="title"\r\n\r\nFlooded Intersection from Ruptured Main\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="description"\r\n\r\nSevere water loss spraying into road. Traffic blocked.\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="citizenName"\r\n\r\nSarah Jenkins\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="address"\r\n\r\n450 Lexington Avenue\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="lat"\r\n\r\n40.7512\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="lng"\r\n\r\n-73.9755\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Disposition: form-data; name="photo"; filename="burst_pipe_test.jpg"\r\n`;
    multipartBody += `Content-Type: image/jpeg\r\n\r\n`;

    const bodyHead = Buffer.from(multipartBody, 'utf8');
    const bodyTail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const fullPayload = Buffer.concat([bodyHead, fakePhotoData, bodyTail]);

    const created = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/issues',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullPayload.length
      }
    }, fullPayload);

    assert(created.status === 201, 'Issue creation returned HTTP 201 Created');
    assert(created.data.data && created.data.data.ticketId.startsWith('AQ-'), 'Generated Ticket ID with AQ- prefix');
    assert(created.data.data.status === 'Reported', 'Initial status set to "Reported"');
    assert(created.data.data.imageUrl.includes('/uploads/'), 'Photo uploaded and stored in /uploads/ directory');

    const createdTicket = created.data.data.ticketId;

    // Verify uploaded file actually exists on filesystem
    const uploadedFileName = path.basename(created.data.data.imageUrl);
    const uploadedFilePath = path.join(__dirname, 'public', 'uploads', uploadedFileName);
    assert(fs.existsSync(uploadedFilePath), 'Uploaded photo file physically verified on disk');

    // TEST 6: Issue Status Lifecycle (Reported -> Assigned -> In Progress -> Resolved)
    console.log('\n--- TEST 6: Workflow Lifecycle System ---');
    
    // Step A: Assign to Officer
    const assignPayload = JSON.stringify({
      status: 'Assigned',
      officer: 'Officer Liam Thorne (Squad 4)',
      department: 'Water Supply & Main Pipelines',
      note: 'Dispatched emergency squad with shutoff keys'
    });
    const step1 = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${createdTicket}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(assignPayload) }
    }, assignPayload);
    assert(step1.status === 200 && step1.data.data.status === 'Assigned', 'Status updated to "Assigned"');
    assert(step1.data.data.assignedOfficer === 'Officer Liam Thorne (Squad 4)', 'Officer assigned correctly');

    // Step B: In Progress
    const progressPayload = JSON.stringify({
      status: 'In Progress',
      note: 'Field crew arrived. Main valve shut off. Excavation started.'
    });
    const step2 = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${createdTicket}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(progressPayload) }
    }, progressPayload);
    assert(step2.status === 200 && step2.data.data.status === 'In Progress', 'Status updated to "In Progress"');

    // Step C: Resolved
    const resolvedPayload = JSON.stringify({
      status: 'Resolved',
      resolutionNotes: 'Pipe joint replaced with 8-inch stainless clamp. Pressure restored to 65 PSI. Road reopened.',
      note: 'Repairs completed and flow tested'
    });
    const step3 = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${createdTicket}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(resolvedPayload) }
    }, resolvedPayload);
    assert(step3.status === 200 && step3.data.data.status === 'Resolved', 'Status updated to "Resolved"');
    assert(step3.data.data.timeline.length >= 4, `Chronological timeline recorded all ${step3.data.data.timeline.length} audit entries`);

    // TEST 7: Authority Dashboard Query & Filters
    console.log('\n--- TEST 7: Authority Dashboard Queries & Filters ---');
    const filteredByResolved = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/issues?status=Resolved',
      method: 'GET'
    });
    assert(filteredByResolved.status === 200 && filteredByResolved.data.data.every(i => i.status === 'Resolved'), 'Dashboard filter by status=Resolved works');

    const searchResult = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues?search=${createdTicket}`,
      method: 'GET'
    });
    assert(searchResult.status === 200 && searchResult.data.data.length === 1, 'Dashboard search by Ticket ID works');

    // TEST 8: Analytics & Hotspot Telemetry
    console.log('\n--- TEST 8: Analytics & Hotspot Telemetry ---');
    const analytics = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/analytics',
      method: 'GET'
    });
    assert(analytics.status === 200, 'Analytics endpoint returned 200');
    assert(analytics.data.data.overview.total >= 7, 'Analytics calculates correct total issues count');
    assert(Object.keys(analytics.data.data.categoryBreakdown).length > 0, 'Analytics returns category distribution for charts');
    assert(Array.isArray(analytics.data.data.hotspots), 'Analytics returns hotspot rankings array');

    // TEST 9: Citizen Ticket Tracker Lookup
    console.log('\n--- TEST 9: Citizen Ticket Tracker ---');
    const tracked = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${createdTicket}`,
      method: 'GET'
    });
    assert(tracked.status === 200 && tracked.data.data.ticketId === createdTicket, 'Citizen tracker retrieves exact case file');
    assert(tracked.data.data.status === 'Resolved', 'Citizen tracker displays current resolution status');

    console.log('\n========================================================');
    console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
