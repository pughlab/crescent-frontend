const mongoose = require('mongoose')

const DatasetSchema = new mongoose.Schema({
  // MinIO bucket name
  datasetID: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true
  }
  // // MinIO object names
  // barcodesID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true
  // },
  // featuresID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true
  // },
  // matrixID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true
  // }
})

module.exports = DatasetSchema