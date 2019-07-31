const mongoose = require('mongoose')

const RunSchema = new mongoose.Schema({
  runId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  params: String
})

module.exports = RunSchema