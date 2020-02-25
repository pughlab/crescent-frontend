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
        const dataset = await Datasets.create({})
        const {datasetID} = dataset
        const bucketName = `dataset-${datasetID}`
        await minioClient.makeBucket(bucketName)
        // Put files into bucket
        const putUploadIntoBucket = async (bucketName, file) => {
          const {filename, mimetype, encoding, createReadStream} = await file
          await minioClient.putObject(bucketName, filename, createReadStream())
        }
        const files = [matrix, features, barcodes, ... R.isNil(metadata) ? [] : [metadata]]
        for (const file of files) {
          await putUploadIntoBucket(bucketName, file)
        }
        console.log('Creating dataset ', datasetID)
        return dataset
      } catch(error) {
        console.log(error)
      }
    },

    deleteDataset: async (parent, {datasetID}, {Datasets, minioClient}) => {
      try {
        const dataset = await Datasets.findOne({datasetID})
        await Datasets.deleteOne({datasetID})
        // Get bucket contents
        const bucketName = `dataset-${datasetID}`
        const bucketContents = await (new Promise(
          (resolve, reject) => {
            let objectsList = []
            const objectsStream = minioClient.listObjects(bucketName)
            objectsStream.on('data', obj => objectsList.push(obj.name))
            objectsStream.on('error', e => reject(e))
            objectsStream.on('end', () => resolve(objectsList))
          }
        ))
        await minioClient.removeObjects(bucketName, bucketContents)
        await minioClient.removeBucket(bucketName)
        console.log('Deleting dataset ', datasetID)
        // Will be null
        return dataset
      } catch(error) {
        console.log(error)
      }
    }
  }
}

module.exports = resolvers