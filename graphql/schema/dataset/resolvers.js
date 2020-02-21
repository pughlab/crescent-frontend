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
    createDataset: async (parent, {matrix, features, barcodes, metadata}, {Datasets, minioClient}) => {
      try {
        const dataset = await Datasets.create({})
        const {datasetID} = dataset
        const bucketName = `dataset-${datasetID}`
        await minioClient.makeBucket(bucketName)

        const {filename, mimetype, encoding, createReadStream} = await matrix
        console.log(filename)
        const stream = createReadStream()
        await minioClient.putObject(bucketName, filename, stream)

        // for (const file of [matrix, features, barcodes, ... R.isNil(metadata) ? [] : [metadata]]) {

        // }
        return dataset
      } catch(error) {
        console.log(error)
      }
    }
  }
}

module.exports = resolvers