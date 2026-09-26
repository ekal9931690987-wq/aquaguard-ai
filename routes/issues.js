/**
 * AquaGuard AI - Issue Management REST API Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('../services/db');
const { analyzeIssue } = require('../services/aiClassifier');
const { checkForDuplicates } = require('../services/duplicateDetector');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'issue-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 1. GET /api/issues - List issues with query filters
router.get('/', async (req, res) => {
  try {
    const { status, severity, category, search } = req.query;
    const issues = await db.getAllIssues({ status, severity, category, search });
    res.json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/issues/:id - Get single issue details
router.get('/:id', async (req, res) => {
  try {
    const issue = await db.getIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }
    res.json({ success: true, data: issue });
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/issues/analyze-preview - Real-time AI preview before submission
router.post('/analyze-preview', (req, res) => {
  try {
    const { title, description, categoryOverride, hasPhoto, fileName } = req.body;
    const analysis = analyzeIssue({
      title: title || '',
      description: description || '',
      categoryOverride,
      hasPhoto: !!hasPhoto,
      fileName: fileName || ''
    });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/issues/check-duplicate - Check for duplicates within radius
router.post('/check-duplicate', async (req, res) => {
  try {
    const { lat, lng, categoryId, title } = req.body;
    const allIssues = await db.getAllIssues();
    const result = checkForDuplicates({ lat, lng, categoryId, title }, allIssues, 250);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/issues - Submit new issue (with photo upload)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const body = req.body;
    let imageUrl = body.imageUrl || '';

    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    const title = body.title || 'Reported Water Issue';
    const description = body.description || '';
    const hasPhoto = Boolean(imageUrl);

    // Run AI Classification & Severity Engine
    const aiAnalysis = analyzeIssue({
      title,
      description,
      categoryOverride: body.categoryOverride || null,
      hasPhoto,
      fileName: req.file ? req.file.originalname : ''
    });

    // Check for Duplicates
    const lat = parseFloat(body.lat || 40.7580);
    const lng = parseFloat(body.lng || -73.9855);
    const allIssues = await db.getAllIssues();
    const duplicateCheck = checkForDuplicates(
      { lat, lng, categoryId: aiAnalysis.categoryId, title },
      allIssues,
      250
    );

    const issuePayload = {
      title,
      description,
      citizenName: body.citizenName || 'Anonymous Citizen',
      citizenContact: body.citizenContact || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=600&q=80',
      category: aiAnalysis.category,
      categoryId: aiAnalysis.categoryId,
      severity: aiAnalysis.severity,
      assignedDepartment: aiAnalysis.department,
      location: {
        address: body.address || 'Street Location, Ward Metro',
        landmark: body.landmark || '',
        ward: body.ward || 'Ward 4 - Metro Central',
        coordinates: { lat, lng }
      },
      aiAnalysis,
      duplicateOf: duplicateCheck.hasDuplicate ? duplicateCheck.closestMatch.issueId : null
    };

    const savedIssue = await db.createIssue(issuePayload);

    res.status(201).json({
      success: true,
      message: 'Issue reported and AI classified successfully',
      data: savedIssue,
      duplicateWarning: duplicateCheck.hasDuplicate ? duplicateCheck : null
    });
  } catch (err) {
    console.error('Error submitting issue:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. PATCH /api/issues/:id/status - Update Status & Officer Assignment
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, note, officer, department, resolutionNotes, updatedBy } = req.body;
    const updated = await db.updateIssueStatus(req.params.id, {
      status,
      note,
      officer,
      department,
      resolutionNotes,
      updatedBy: updatedBy || 'Authority Dashboard'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    res.json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: updated
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. POST /api/issues/:id/upvote - Upvote issue
router.post('/:id/upvote', async (req, res) => {
  try {
    const updated = await db.upvoteIssue(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }
    res.json({
      success: true,
      message: 'Issue upvoted (+1 verification count)',
      data: updated
    });
  } catch (err) {
    console.error('Error upvoting issue:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. DELETE /api/issues/:id - Remove issue
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.deleteIssue(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }
    res.json({ success: true, message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
