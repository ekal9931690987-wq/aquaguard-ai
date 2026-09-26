const mongoose = require('mongoose');

const TimelineEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' },
  note: { type: String, default: '' }
}, { _id: false });

const IssueSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  citizenName: {
    type: String,
    default: 'Anonymous Citizen'
  },
  citizenContact: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    default: 'pipe_burst'
  },
  severity: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Reported', 'Assigned', 'In Progress', 'Resolved'],
    default: 'Reported',
    index: true
  },
  assignedDepartment: {
    type: String,
    default: 'Water Supply & Main Pipelines'
  },
  assignedOfficer: {
    type: String,
    default: 'Unassigned'
  },
  location: {
    address: { type: String, default: '' },
    landmark: { type: String, default: '' },
    ward: { type: String, default: 'Ward 4 - Metro Central' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  aiAnalysis: {
    category: String,
    categoryId: String,
    severity: String,
    severityScore: Number,
    severityColor: String,
    confidence: String,
    targetSLA: String,
    estimatedWaterLoss: String,
    recommendedEquipment: [String],
    visualTags: [String],
    aiModelUsed: String,
    analyzedAt: Date
  },
  upvotes: {
    type: Number,
    default: 1
  },
  duplicateOf: {
    type: String,
    default: null
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  timeline: [TimelineEntrySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Issue', IssueSchema);
