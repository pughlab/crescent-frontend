const mongoose = require('mongoose')

const DatasetSchema = new mongoose.Schema({
  // MinIO bucket name
  datasetID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // MinIO object names
  barcodesID: {
    type: String,
    default: null
  },
  featuresID: {
    type: String,
    default: null
  },
  matrixID: {
    type: String,
    default: null
  }
})

module.exports = DatasetSchema