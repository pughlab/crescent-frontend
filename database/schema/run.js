const mongoose = require('mongoose')

const RunSchema = new mongoose.Schema({
  runID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  params: {
    type: String,
    // required: true
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'submitted', 'completed'],
    default: 'pending'
  }
})

module.exports = RunSchema