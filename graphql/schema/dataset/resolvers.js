const R = require('ramda')
const RA = require('ramda-adjunct')
const {ApolloError} = require('apollo-server')

const resolvers = {
  Dataset: {
    size: async ({datasetID}, variables, {Datasets, Minio}) => {
      try {
        const bucketContents = await Minio.bucketObjectsList(`dataset-${datasetID}`)
        return R.compose(
          R.sum,
          R.pluck('size')
        )(bucketContents)
      } catch(error) {
        console.log(error)
      }
    },
    hasMetadata: async ({datasetID}, variables, {Datasets, Minio}) => {
      try {
        return Minio.bucketHasObject(`dataset-${datasetID}`, 'metadata.tsv')
      } catch(error) {
        console.log('hasMetadata', error)
      }
    },
  },

  Query: {
    dataset: async (parent, {datasetID}, {Datasets}) => {
      try {
        const dataset = await Datasets.findOne({datasetID})
        return dataset
      } catch(error) {
        console.log(error)
      }
    }
  },
  Mutation: {
    // TODO: sometimes uploading dataset without metadata fails
    createDataset: async (parent, {name, matrix, features, barcodes, metadata}, {Datasets, Minio}) => {
      try {
        // Make dataset document and bucket
        const dataset = await Datasets.create({name})
        const {datasetID} = dataset
        const bucketName = `dataset-${datasetID}`
        await Minio.client.makeBucket(bucketName)
        const files = [matrix, features, barcodes, ... R.isNil(metadata) ? [] : [metadata]]
        for (const file of files) {
          await Minio.putUploadIntoBucket(bucketName, file)
        }
        console.log('Creating dataset ', datasetID)
        return dataset
      } catch(error) {
        console.log('createDataset', error)
      }
    },

    deleteDataset: async (parent, {datasetID}, {Datasets, Minio}) => {
      try {
        const dataset = await Datasets.findOne({datasetID})
        await Datasets.deleteOne({datasetID})
        const bucketName = `dataset-${datasetID}`
        await Minio.deleteBucketAndObjects(bucketName)
        console.log('Deleting dataset ', datasetID)
        return dataset
      } catch(error) {
        console.log(error)
      }
    },

    tagDataset: async (parent, {datasetID, cancerTag, oncotreeCode}, {Datasets}) => {
      try {
        const dataset = await Datasets.findOne({datasetID})
        dataset.cancerTag = cancerTag
        dataset.oncotreeCode = oncotreeCode
        await dataset.save()
        return dataset
      } catch(error) {
        console.log(error)
      }
    },

    uploadDatasetMetadata: async (parent, {datasetID, metadata}, {Datasets, Minio}) => {
      try {
        const dataset = await Datasets.findOne({datasetID})
        console.log(dataset)
        if (RA.isNotNil(dataset)) {
          const bucketName = `dataset-${datasetID}`
          await Minio.putUploadIntoBucket(bucketName, metadata, 'metadata.tsv')          
          return dataset
        }
      } catch(error) {
        console.log(error)
      }
    }
  },
}

module.exports = resolvers