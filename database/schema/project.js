const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  // 
  kind: {
    type: String,
    default: 'uploaded',
    enum: ['uploaded', 'curated']
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  accession: {
    type: Number,
    required: false
  },
  externalUrls: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  // User that created new project
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Users that have access (N:1 user to project mapping)
  sharedWith: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  // Whether project has been 'deleted'
  archived: {
    type: Date,
    default: null
  },

  // All runs created from data associated to this project
  runs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },

  // Merged projects
  mergedProjectIDs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  uploadedDatasetIDs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },

})

module.exports = ProjectSchema