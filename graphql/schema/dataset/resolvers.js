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
        // Make dataset document and bucket
        const bucketName = await (async () => {
          const {datasetID} = await Datasets.create({})
          const bucketName = `dataset-${datasetID}`
          await minioClient.makeBucket(bucketName)
          return bucketName
        })
        // Put files into bucket
        const putUploadIntoBucket = async (bucketName, file) => {
          const {filename, mimetype, encoding, createReadStream} = await file
          await minioClient.putObject(bucketName, filename, createReadStream())
        }
        const files = [matrix, features, barcodes, ... R.isNil(metadata) ? [] : [metadata]]
        for (const file of files) {
          await putUploadIntoBucket(bucketName, file)
        }
        return dataset
      } catch(error) {
        console.log(error)
      }
    },
  }
}

module.exports = resolvers