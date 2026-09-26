/**
 * AquaGuard AI - Analytics & Hotspot Intelligence Module
 * Renders Chart.js data visualizations and municipal hotspot leaderboards.
 */

let categoryChart = null;
let severityChart = null;
let trendChart = null;

async function loadAnalyticsData() {
  try {
    const resp = await fetch('/api/analytics');
    const result = await resp.json();

    if (!result.success || !result.data) {
      console.warn('Failed to fetch analytics:', result);
      return;
    }

    const { overview, categoryBreakdown, wardBreakdown, hotspots, dbMode } = result.data;

    // 1. Populate KPI stats in Analytics Hub
    updateStatElement('an-total-issues', overview.total);
    updateStatElement('an-critical-issues', overview.critical);
    updateStatElement('an-resolved-issues', overview.resolved);
    updateStatElement('an-resolution-rate', overview.resolutionRate);
    updateStatElement('an-avg-sla', overview.averageResolutionHours);
    updateStatElement('an-sla-compliance', overview.slaComplianceRate);
    updateStatElement('an-db-mode', dbMode);

    // 2. Render Charts
    renderCategoryChart(categoryBreakdown);
    renderSeverityChart(overview);
    renderTrendChart();

    // 3. Render Hotspot Ward Leaderboard
    renderHotspotTable(hotspots);

  } catch (err) {
    console.error('Error loading analytics:', err);
  }
}

function updateStatElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

/**
 * Chart 1: Issue Distribution by Category (Doughnut)
 */
function renderCategoryChart(categoryData) {
  const ctx = document.getElementById('chart-categories');
  if (!ctx) return;

  const labels = Object.keys(categoryData || {});
  const data = Object.values(categoryData || {});

  const colors = [
    '#00d2ff', '#ff3366', '#ff7d00', '#ffb703',
    '#00e5a3', '#8b5cf6', '#ec4899', '#3b82f6'
  ];

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map(l => l.length > 25 ? l.substring(0, 22) + '...' : l),
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#0e172e',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            font: { family: 'Plus Jakarta Sans', size: 11 },
            boxWidth: 12
          }
        },
        tooltip: {
          backgroundColor: 'rgba(14, 23, 46, 0.95)',
          titleColor: '#fff',
          bodyColor: '#00d2ff',
          borderColor: 'rgba(0, 210, 255, 0.3)',
          borderWidth: 1
        }
      },
      cutout: '68%'
    }
  });
}

/**
 * Chart 2: Issues by Severity Level (Bar Chart)
 */
function renderSeverityChart(overview) {
  const ctx = document.getElementById('chart-severity');
  if (!ctx) return;

  if (severityChart) {
    severityChart.destroy();
  }

  severityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        label: 'Issues Count',
        data: [overview.critical, overview.high, overview.medium, overview.low],
        backgroundColor: ['#ff3366', '#ff7d00', '#ffb703', '#00e5a3'],
        borderRadius: 8,
        barThickness: 34
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 12 } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(14, 23, 46, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1
        }
      }
    }
  });
}

/**
 * Chart 3: 7-Day Resolution Velocity & Influx
 */
function renderTrendChart() {
  const ctx = document.getElementById('chart-trends');
  if (!ctx) return;

  if (trendChart) {
    trendChart.destroy();
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const reportedData = [8, 12, 10, 15, 14, 18, 11];
  const resolvedData = [6, 11, 9, 14, 16, 17, 10];

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Reported Incidents',
          data: reportedData,
          borderColor: '#ff3366',
          backgroundColor: 'rgba(255, 51, 102, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#ff3366'
        },
        {
          label: 'Resolved by Field Crew',
          data: resolvedData,
          borderColor: '#00e5a3',
          backgroundColor: 'rgba(0, 229, 163, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#00e5a3'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      }
    }
  });
}

/**
 * Render Hotspot Ranking Table
 */
function renderHotspotTable(hotspots = []) {
  const tbody = document.getElementById('hotspots-table-body');
  if (!tbody) return;

  if (hotspots.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#94a3b8;">No high-density active hotspot zones detected.</td></tr>`;
    return;
  }

  tbody.innerHTML = hotspots.map((hs, index) => {
    const riskBadgeClass = hs.riskLevel.replace(/\s+/g, '');
    return `
      <tr>
        <td style="font-weight:700; color:#fff;">#${index + 1}</td>
        <td style="font-weight:600; color:#fff;">
          🏢 ${hs.ward}
        </td>
        <td>
          <span style="font-weight:800; font-size:1.1rem; color:#00d2ff;">${hs.activeIssuesCount}</span>
          <span style="color:#64748b; font-size:0.8rem;"> active issues</span>
        </td>
        <td>
          <span class="hotspot-risk-badge ${riskBadgeClass}">
            ${hs.riskLevel === 'Critical Zone' ? '🚨' : hs.riskLevel === 'High Alert' ? '⚠️' : '✅'}
            ${hs.riskLevel}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

window.loadAnalyticsData = loadAnalyticsData;
