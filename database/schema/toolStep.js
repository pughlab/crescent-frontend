const mongoose = require('mongoose')

const ToolStepSchema = new mongoose.Schema({
  toolStepID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  step: {
    type: String,
    required: true
  },
  parameter: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  disabled: {
    type: Boolean,
    required: true
  }
})

module.exports = ToolStepSchema