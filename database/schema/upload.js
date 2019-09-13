const mongoose = require('mongoose')

const UploadSchema = new mongoose.Schema({
  // MinIO object name
  uploadID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
})

module.exports = UploadSchema