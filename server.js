/**
 * AquaGuard AI - Main Server Application
 * Express.js Backend with MongoDB & Local Dual-Persistence Engine
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const db = require('./services/db');
const issuesRouter = require('./routes/issues');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static frontend assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'AquaGuard AI',
    timestamp: new Date().toISOString(),
    database: db.isMongoConnected() ? 'MongoDB' : 'Local JSON Persistent Database'
  });
});

// Analytics & Hotspot Endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const stats = await db.getAnalytics();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mount Issues API
app.use('/api/issues', issuesRouter);

// SPA Fallback for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Database & Start Server
async function startServer() {
  await db.initializeDatabase();

  app.listen(PORT, () => {
    console.log(`
========================================================
🌊 AQUAGUARD AI - WATER & CIVIC INFRASTRUCTURE ENGINE
========================================================
🚀 Server running at: http://localhost:${PORT}
📊 Database Mode:    ${db.isMongoConnected() ? 'MongoDB (Connected)' : 'Local JSON Persistence Active'}
🌐 Frontend Portal:   http://localhost:${PORT}
🗺️ Live Map:          http://localhost:${PORT}/#map
📋 Admin Dashboard:   http://localhost:${PORT}/#dashboard
📈 Analytics Hub:     http://localhost:${PORT}/#analytics
========================================================
`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
});
