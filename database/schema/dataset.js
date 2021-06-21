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
  },

  // Ontology tagging
  cancerTag: {
    type: Boolean,
    default: true
  },
  oncotreeCode: {
    type: String,
    default: null
  },
  customTags: {
    type: [String],
    default: null
  },
  size:{
    type: Number,
    default: null
  },
  numGenes: {
    type: Number,
    default: null
  },
  numCells:{
    type: Number,
    default: null
  }
})

module.exports = DatasetSchema