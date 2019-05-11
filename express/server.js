const submitCWL = require('./submit')

// Servers
const autobahn = require('autobahn')
const connection = new autobahn.Connection({url: 'ws://127.0.0.1:4000/', realm: 'realm1'})
const express = require('express')
const cors = require('cors')
// MINIO
const Minio = require('minio')
// Multer to handle multi form data
const multer = require('multer')
const upload = multer({dest: '/Users/smohanra/Desktop/crescentMockup/express'})
// Zip
const AdmZip = require('adm-zip')



// Start autobahn connectio to WAMP router and init node server
connection.onopen = function (session) {
  // Minio client
  // Instantiate the minio client with the endpoint
  // and access keys as shown below.
  const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    // CHANGE THESE WHEN RUNNING MINIO FROM DOCKER
    accessKey: 'crescent-access',
    secretKey: 'crescent-secret'
  });
  // Make a bucket called crescent.
  minioClient.makeBucket('crescent', 'us-east-1', function(err) {
    if (err) return console.log(err)
    console.log('Bucket created successfully in "us-east-1".')
  })
  const bucketName = 'crescent'
  const expressPath = '/Users/smohanra/Desktop/crescentMockup/express'
  const minioPath = `${expressPath}/tmp/minio`

  // Register method to run example
  session
    .register(
      'crescent.submit',
      (args, kwargs) => {
        // console.log(args)
        console.log('RUN YOUR CWL COMMAND HERE, workflow arguments in kwargs variable')
        console.log(kwargs)
        submitCWL(kwargs, session)
        return 'result of run submission'
      }
    )
    .then(
      reg => console.log('Registered: ', reg.procedure),
      err => console.error('Registration error: ', err)
    )


  // Start node server for HTTP stuff
  const app = express()
  const port = 4001
  app.put(
    '/upload/barcodes',
    upload.single('uploadedFile'),
    (req, res, next) => {
      // File that needs to be uploaded.
      const file = req.file
      // console.log(file)
      const metaData = {
        'Content-Type': 'application/octet-stream',
        'X-Amz-Meta-Testing': 1234,
        'example': 5678
      }
      // Using fPutObject API upload your file to the bucket
      minioClient.fPutObject(bucketName, 'barcodes.tsv', file.path, metaData, function(err, etag) {
        if (err) return console.log(err, etag)
        console.log('File uploaded successfully.')
        // Publish to upload notification channel when MinIO done
        // Do this for each file you need
        minioClient.fGetObject('crescent', 'barcodes.tsv', `${minioPath}/barcodes.tsv`,
          err => {
            if (err) {return console.log(err)}
            console.log('File successfully downloaded')
            session.publish('crescent.upload', [], {uploadedFilePath: etag})
          }
        )
      })
      res.sendStatus(200)
    }
  )
  app.put(
    '/upload/genes',
    upload.single('uploadedFile'),
    (req, res, next) => {
      // File that needs to be uploaded.
      const file = req.file
      const metaData = {
        'Content-Type': 'application/octet-stream',
        'X-Amz-Meta-Testing': 1234,
        'example': 5678
      }
      // Using fPutObject API upload your file to the bucket
      minioClient.fPutObject(bucketName, 'genes.tsv', file.path, metaData, function(err, etag) {
        if (err) return console.log(err, etag)
        console.log('File uploaded successfully.')
        // Download file from bucket so that CWL will have access
        minioClient.fGetObject('crescent', 'genes.tsv', `${minioPath}/genes.tsv`,
          err => {
            if (err) {return console.log(err)}
            console.log('File successfully downloaded')
            session.publish('crescent.upload', [], {uploadedFilePath: etag})
          }
        )
      })
      res.sendStatus(200)
    }
  )
  app.put(
    '/upload/matrix',
    upload.single('uploadedFile'),
    (req, res, next) => {
      // File that needs to be uploaded.
      const file = req.file
      // console.log(file)
      const metaData = {
        'Content-Type': 'application/octet-stream',
        'X-Amz-Meta-Testing': 1234,
        'example': 5678
      }
      // Using fPutObject API upload your file to the bucket
      minioClient.fPutObject(bucketName, 'matrix.mtx', file.path, metaData, function(err, etag) {
        if (err) return console.log(err, etag)
        console.log('File uploaded successfully.')
        // Publish to upload notification channel when MinIO done
        minioClient.fGetObject('crescent', 'matrix.mtx', `${minioPath}/matrix.mtx`,
          err => {
            if (err) {return console.log(err)}
            console.log('File successfully downloaded')
            session.publish('crescent.upload', [], {uploadedFilePath: etag})
          }
        )
        
      })
      res.sendStatus(200)
    }
  )

  app.get(
    '/result',
    (req, res) => {
      const tsneFile = '/Users/smohanra/Documents/crescent/docker-crescent/frontend_seurat_output/SEURAT/frontend_example_mac_10x_cwl_res1.SEURAT_TSNEPlot.png'
      res.sendFile(tsneFile)
    }
  )

  app.get(
    '/download',
    (req, res) => {
      const zip = new AdmZip()
      zip.addLocalFolder('/Users/smohanra/Documents/crescent/docker-crescent/frontend_seurat_output/SEURAT')
      zip.writeZip('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip')
      res.download('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip', 'test.zip')
    }
  )


  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

connection.open()