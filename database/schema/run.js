const mongoose = require('mongoose')

const RunSchema = new mongoose.Schema({
  // TODO: remove this
  // runID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   auto: true
  // },
  runID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true
  },
  params: {
    type: String,
    required: true
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
})

module.exports = RunSchema