const R = require('ramda')
const RA = require('ramda-adjunct')
const {ApolloError} = require('apollo-server')
const zlib = require('zlib');
const readline = require('readline');

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
    createDataset: async (parent, {name, matrix, features, barcodes}, {Datasets, Minio}) => {
      try {
        // Make dataset document
        const dataset = await Datasets.create({name})

        //create a minio bucket and upload all the files to it
        const {datasetID} = dataset
        const bucketName = `dataset-${datasetID}`
        await Minio.client.makeBucket(bucketName)
        const files = [matrix, features, barcodes]
        for (const file of files) {
          await Minio.putUploadIntoBucket(bucketName, file)
        }

        // calculate the total size of the files in bucket
        dataset.size = await Minio.bucketSize(bucketName)

        // count cells and genes (https://stackoverflow.com/questions/38074288/read-gzip-stream-line-by-line)
        const getFileLineCount = async (file) => {
          const { createReadStream } = await file;
          const stream = createReadStream();
          const lineReader = (stream) => readline.createInterface({
              input: stream.pipe(zlib.createGunzip()),
              crlfDelay: Infinity
          });
          const countLines = async () => {
            let count = 0
            for await (const line of lineReader(stream)) count+=1
            return count
          }
          return await countLines(stream)
        };
        dataset.numCells = await getFileLineCount(barcodes)
        dataset.numGenes = await getFileLineCount(features)
        
        await dataset.save()

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
    },

    // customTagsDataset: async (parent, {datasetID, customTags}, {Projects}) => {
    //   const dataset = await Datasets.findOne({datasetID})
    //   dataset.customTags = R.uniq(customTags) //Just in case...
    //   await dataset.save()
    //   return dataset
    // },


    addCustomTagDataset: async (parent, {datasetID, customTag}, {Datasets}) => {
    try {
      const dataset = await Datasets.findOne({datasetID})
      const {customTags} = dataset
      dataset.customTags = R.append(customTag, customTags)
      await dataset.save()
      return dataset
    } catch(error) {
        console.log(error)
      }
    },

    removeCustomTagDataset: async (parent, {datasetID, customTag}, {Datasets}) => {
      try {
        const dataset = await Datasets.findOne({datasetID})
        const customTags = dataset.customTags  
        dataset.customTags = R.reject(R.equals(customTag), customTags)
        await dataset.save()
        return dataset
      } catch(error) {
          console.log(error)
        }
    },
  }
}

module.exports = resolvers