const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'minio',
  port: parseInt(process.env.MINIO_HOST_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

module.exports = {
  client: minioClient,

  // METHODS
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
}
