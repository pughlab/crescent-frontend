const mongoose = require('mongoose')

const DatasetSchema = new mongoose.Schema({
  // MinIO bucket name
  datasetID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  // MinIO object names
  barcodesID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  featuresID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  matrixID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  }
})

module.exports = DatasetSchema