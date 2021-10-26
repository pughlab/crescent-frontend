const Minio = require('minio');
const R = require('ramda')
const RA = require('ramda-adjunct')

const minioClient = new Minio.Client({
  endPoint: 'crescent-dev.ccm.sickkids.ca',
  port: parseInt(process.env.MINIO_HOST_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})



module.exports = {
  client: minioClient,

  // METHODS
  // Puts a file into bucket
  putUploadIntoBucket: async (bucketName, file, objectName) => {
    const {filename, mimetype, encoding, createReadStream} = await file
    await minioClient.putObject(bucketName, objectName || filename, createReadStream())
  },

  // Returns stream of objects list
  bucketObjectsList: async bucketName => {
    try {
      return await (new Promise(
        (resolve, reject) => {
          let objectsList = []
          const objectsStream = minioClient.listObjects(bucketName)
          objectsStream.on('data', obj => objectsList.push(obj))
          objectsStream.on('error', e => reject(e))
          objectsStream.on('end', () => resolve(objectsList))
        }
      ))
    } catch(error) {
      console.log(error)
    }
  },

  bucketHasObject: async (bucketName, objectName) => {
    try {
      const objectStat = await minioClient.statObject(bucketName, objectName)
      console.log('objectStat', objectStat)
      return RA.isNotNil(objectStat)
    } catch(error) {
      if (R.propEq('code', 'NotFound', error)) {
        return false
      } else {
        console.log('bucketHasObject', error)
      }
    }
  },

  deleteBucketAndObjects: async bucketName => {
    try {
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
    } catch(error) {
      console.log(error)
    }
  }, 

  bucketSize: async bucketName => {
    try {
      return await (new Promise(
        (resolve, reject) => {
          let totalSize = 0
          const objectsStream = minioClient.listObjects(bucketName)
          objectsStream.on('data', obj => totalSize += obj.size)
          objectsStream.on('error', e => reject(e))
          objectsStream.on('end', () => resolve(totalSize))
        }
      ))
    } catch(error) {
      console.log(error)
    }
  }
}
