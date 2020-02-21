const R = require('ramda')

const {
  ApolloError
} = require('apollo-server')

const resolvers = {
  Query: {
    dataset: async (parent, {datasetID}, {Datasets}) => {
      return null
    }
  },
  Mutation: {
    // replaceMetadata
    createDataset: async (parent, {files, matrix, features, barcodes, metadata}, {Datasets, minioClient}) => {
      console.log(files)
      const file = files[0] 
      const {filename} = await file
      console.log(filename)
      return null
    }
  }
}

module.exports = resolvers