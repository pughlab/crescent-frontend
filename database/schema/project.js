const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true
  },
  // Can be a 1:N project to project mapping
  children: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  // or...
  // Can be a 1:1 project that encapsulates a dataset
  datasetID: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  // Users that have access (N:1 user to project mapping)
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  runs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
})

module.exports = ProjectSchema