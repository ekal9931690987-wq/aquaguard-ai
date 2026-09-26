/**
 * AquaGuard AI - Full Workflow Simulation & Verification Suite
 * Tests Citizen Reporting Flow, Photo Upload, AI Classification,
 * Severity Scoring, Geospatial Duplicate Checks, Map Telemetry,
 * Authority Dashboard, Filtering, and Lifecycle Status Updates.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function request(options, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {};
    if (data && typeof data === 'string') {
      defaultHeaders['Content-Type'] = 'application/json';
      defaultHeaders['Content-Length'] = Buffer.byteLength(data);
    } else if (data && Buffer.isBuffer(data)) {
      defaultHeaders['Content-Length'] = data.length;
    }

    const mergedHeaders = Object.assign({}, defaultHeaders, headers);
    options.headers = mergedHeaders;

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

async function runVerification() {
  console.log('================================================================');
  console.log('🌊 AQUAGUARD AI - FULL END-TO-END WORKFLOW VERIFICATION SUITE');
  console.log('================================================================\n');

  let checksPassed = 0;
  let checksFailed = 0;

  function verify(condition, description) {
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      checksPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      checksFailed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // FLOW 1: CITIZEN REPORTING FLOW & AI CLASSIFICATION
    // -------------------------------------------------------------
    console.log('>>> [1/5] Testing Citizen Reporting & AI Engine...');

    // A. AI Instant Preview (Pipe Burst)
    const pipePayload = JSON.stringify({
      title: 'Underground high pressure pipe blown open',
      description: 'Water shooting 4 feet into the air, street washed out, cars cannot pass',
      hasPhoto: true
    });
    const pipeAi = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues/analyze-preview', method: 'POST' }, pipePayload);
    verify(pipeAi.status === 200, 'AI Preview API responds with HTTP 200');
    verify(pipeAi.data.analysis.categoryId === 'pipe_burst', 'AI categorizes as Pipe Burst');
    verify(pipeAi.data.analysis.severity === 'Critical', 'AI detects Critical severity (4h SLA)');
    verify(pipeAi.data.analysis.estimatedWaterLoss.includes('Liters'), 'AI estimates water loss rate');
    verify(pipeAi.data.analysis.recommendedEquipment.length > 0, 'AI recommends field equipment tooling');

    // B. AI Instant Preview (Contaminated Water)
    const dirtyPayload = JSON.stringify({
      title: 'Tap water brown and smelling like chemical sewage',
      description: 'Foul odor, muddy particles, residents reporting illness',
      hasPhoto: true
    });
    const dirtyAi = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues/analyze-preview', method: 'POST' }, dirtyPayload);
    verify(dirtyAi.data.analysis.categoryId === 'water_contamination', 'AI categorizes Drinking Water Contamination');
    verify(dirtyAi.data.analysis.department.includes('Public Health'), 'AI routes to Public Health Division');

    // C. Geospatial Duplicate Check
    const dupCheck = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/issues/check-duplicate',
      method: 'POST'
    }, JSON.stringify({
      lat: 40.7628,
      lng: -73.9744,
      categoryId: 'pipe_burst',
      title: 'Water leak on 5th Ave'
    }));
    verify(dupCheck.status === 200 && dupCheck.data.hasDuplicate === true, 'Geospatial duplicate detector flags nearby active issue');
    verify(dupCheck.data.closestMatch.distanceMeters <= 50, 'Duplicate detector calculates precise distance (<= 50m)');

    // -------------------------------------------------------------
    // FLOW 2: PHOTO UPLOAD & ISSUE CREATION
    // -------------------------------------------------------------
    console.log('\n>>> [2/5] Testing Photo Upload & Issue Creation...');

    const boundary = '----CivicUploadBoundary' + Date.now();
    const fakeJpgBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]); // Valid JPEG header

    let mp = '';
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="title"\r\n\r\nEmergency Main Line Burst on Sunset Blvd\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="description"\r\n\r\nWater main cracked during construction. High volume flooding sidewalk.\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="citizenName"\r\n\r\nCarlos Mendez\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="citizenContact"\r\n\r\n+1 (555) 777-8899\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="ward"\r\n\r\nWard 2 - West Riverside\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="address"\r\n\r\n890 Sunset Boulevard\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="landmark"\r\n\r\nNear City Metro Station\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="lat"\r\n\r\n40.7485\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="lng"\r\n\r\n-73.9920\r\n`;
    mp += `--${boundary}\r\n`;
    mp += `Content-Disposition: form-data; name="photo"; filename="sunset_burst.jpg"\r\n`;
    mp += `Content-Type: image/jpeg\r\n\r\n`;

    const mpHead = Buffer.from(mp, 'utf8');
    const mpTail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const fullBody = Buffer.concat([mpHead, fakeJpgBuffer, mpTail]);

    const createdRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/issues',
      method: 'POST'
    }, fullBody, { 'Content-Type': `multipart/form-data; boundary=${boundary}` });

    verify(createdRes.status === 201, 'Issue created with status HTTP 201');
    const createdIssue = createdRes.data.data;
    verify(createdIssue.ticketId && createdIssue.ticketId.startsWith('AQ-'), `Ticket ID generated: ${createdIssue.ticketId}`);
    verify(createdIssue.status === 'Reported', 'Initial state is "Reported"');
    verify(createdIssue.imageUrl.startsWith('/uploads/'), `Uploaded image stored at: ${createdIssue.imageUrl}`);

    // Verify static serving of uploaded image
    const photoFetch = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: createdIssue.imageUrl,
      method: 'GET'
    });
    verify(photoFetch.status === 200, 'Uploaded photo served statically with HTTP 200');

    // -------------------------------------------------------------
    // FLOW 3: AUTHORITY DASHBOARD & FILTERS
    // -------------------------------------------------------------
    console.log('\n>>> [3/5] Testing Authority Dashboard & Filters...');

    // A. Fetch All
    const allIssues = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues', method: 'GET' });
    verify(allIssues.status === 200 && allIssues.data.count > 0, `Dashboard loads ${allIssues.data.count} work orders`);

    // B. Filter by Status
    const reportedOnly = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues?status=Reported', method: 'GET' });
    verify(reportedOnly.status === 200 && reportedOnly.data.data.every(i => i.status === 'Reported'), 'Filter by status=Reported returns only reported issues');

    // C. Filter by Severity
    const criticalOnly = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues?severity=Critical', method: 'GET' });
    verify(criticalOnly.status === 200 && criticalOnly.data.data.every(i => i.severity === 'Critical'), 'Filter by severity=Critical returns only critical emergencies');

    // D. Search
    const searchRes = await request({ hostname: '127.0.0.1', port: 3000, path: `/api/issues?search=${createdIssue.ticketId}`, method: 'GET' });
    verify(searchRes.data.data.length === 1 && searchRes.data.data[0].ticketId === createdIssue.ticketId, 'Search by Ticket ID locates exact work order');

    // -------------------------------------------------------------
    // FLOW 4: STATUS SYSTEM & AUDIT TIMELINE (Reported -> Assigned -> In Progress -> Resolved)
    // -------------------------------------------------------------
    console.log('\n>>> [4/5] Testing Lifecycle Workflow Status Updates...');
    const ticket = createdIssue.ticketId;

    // Transition 1: Assigned
    const step1 = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${ticket}/status`,
      method: 'PATCH'
    }, JSON.stringify({
      status: 'Assigned',
      officer: 'Officer Maya Brooks (Squad 2)',
      department: 'Water Supply & Main Pipelines',
      note: 'Assigned to Officer Brooks; emergency valve crew dispatched'
    }));
    verify(step1.status === 200 && step1.data.data.status === 'Assigned', 'Transitioned to "Assigned"');
    verify(step1.data.data.assignedOfficer === 'Officer Maya Brooks (Squad 2)', 'Field officer assigned');

    // Transition 2: In Progress
    const step2 = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${ticket}/status`,
      method: 'PATCH'
    }, JSON.stringify({
      status: 'In Progress',
      note: 'Traffic diverted. Sump pump active. Pipe excavation underway.'
    }));
    verify(step2.status === 200 && step2.data.data.status === 'In Progress', 'Transitioned to "In Progress"');

    // Transition 3: Resolved
    const step3 = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/issues/${ticket}/status`,
      method: 'PATCH'
    }, JSON.stringify({
      status: 'Resolved',
      resolutionNotes: 'New 10-inch ductile iron section clamped and pressurized. Road asphalt patched.',
      note: 'Repairs completed and certified'
    }));
    verify(step3.status === 200 && step3.data.data.status === 'Resolved', 'Transitioned to "Resolved"');
    verify(step3.data.data.timeline.length >= 4, `Chronological timeline recorded ${step3.data.data.timeline.length} audit entries`);

    // -------------------------------------------------------------
    // FLOW 5: MAP, ANALYTICS & CITIZEN TRACKER
    // -------------------------------------------------------------
    console.log('\n>>> [5/5] Testing Map Telemetry, Analytics & Tracker...');

    // A. Map Telemetry verification
    const mapIssues = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/issues', method: 'GET' });
    const allHaveCoords = mapIssues.data.data.every(i => {
      const lat = i.location?.coordinates?.lat || i.lat;
      const lng = i.location?.coordinates?.lng || i.lng;
      return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    });
    verify(allHaveCoords, 'All issues contain valid numeric latitude and longitude for Leaflet markers');

    // B. Analytics & Hotspots
    const analytics = await request({ hostname: '127.0.0.1', port: 3000, path: '/api/analytics', method: 'GET' });
    verify(analytics.status === 200, 'Analytics endpoint returns 200 OK');
    verify(analytics.data.data.overview.total >= 7, 'Overview counts total incidents accurately');
    verify(analytics.data.data.hotspots.length > 0, 'Hotspots calculated with active incident clusters');

    // C. Citizen Tracker Lookup
    const tracked = await request({ hostname: '127.0.0.1', port: 3000, path: `/api/issues/${ticket}`, method: 'GET' });
    verify(tracked.status === 200 && tracked.data.data.ticketId === ticket, 'Citizen tracker retrieves ticket successfully');
    verify(tracked.data.data.status === 'Resolved', 'Citizen tracker displays verified "Resolved" state');

    console.log('\n================================================================');
    console.log(`🏁 VERIFICATION COMPLETE: ${checksPassed} PASSED, ${checksFailed} FAILED`);
    console.log('================================================================\n');

    process.exit(checksFailed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal verification error:', err);
    process.exit(1);
  }
}

runVerification();
