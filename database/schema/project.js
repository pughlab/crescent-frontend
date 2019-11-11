const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  kind: {
    type: String,
    default: 'uploaded'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
  runs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  // // Can be a 1:N project to project mapping
  // children: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   default: []
  // },
  // or...
  // // Can be a 1:1 project that encapsulates a dataset
  // datasetID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   default: null
  // },
})

module.exports = ProjectSchema