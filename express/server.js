const submitCWL = require('./submit')

// Servers
const autobahn = require('autobahn')
const connection = new autobahn.Connection({url: 'ws://crossbar:4000/', realm: 'realm1'})
const express = require('express')
const cors = require('cors')
// MINIO
const Minio = require('minio')
// Multer to handle multi form data
const multer = require('multer')
const upload = multer({dest: '/Users/smohanra/Desktop/crescentMockup/express/tmp/express'})
// Zip
const AdmZip = require('adm-zip')

// MongoDB
const db = require('./database')
const mongoose = require('mongoose')
// Run data model
const RunSchema = new mongoose.Schema({
    runId: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    params: String
})
const Run = db.model('run', RunSchema)

const fetchRuns = () => Run.find({})


const R = require('ramda')

// Start autobahn connectio to WAMP router and init node server
connection.onopen = function (session) {
  console.log("autobahn connection opened:")
  // Minio client
  // Instantiate the minio client with the endpoint
  // and access keys as shown below.
  const minioClient = new Minio.Client({
    endPoint: 'minio',
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
        const d = new autobahn.when.defer()
        console.log('RUN YOUR CWL COMMAND HERE, workflow arguments in kwargs variable')
        console.log(kwargs)
        Run.create({params: JSON.stringify(kwargs)},
          (err, run) => {
            if (err) {console.log(err)}
            // console.log(run)
            const {runId} = run
            submitCWL(kwargs, session, runId)
            d.resolve(run)
          }
        )
        return d.promise
      }
    )
    .then(
      reg => console.log('Registered: ', reg.procedure),
      err => console.error('Registration error: ', err)
    )
  session
    .register(
      'crescent.runs',
      (args, kwargs) => {
        return fetchRuns()
        // const d = new autobahn.when.defer()
        // d.resolve(fetchRuns())
        // return d.promise

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
      const {runId, visType} = req.query
      Run.findOne({runId}, (err, run) => {
        if (err) {console.log(err)}
        console.log(run)
        const {runId, params} = run
        const {resolution} = JSON.parse(params)
        console.log(runId, resolution)
        const runPath = `/Users/smohanra/Documents/crescent/docker-crescent/${runId}/SEURAT`
        const vis = R.equals(visType, 'tsne') ? 'SEURAT_TSNEPlot' : R.equals(visType, 'pca') ? 'SEURAT_PCElbowPlot' : R.equals(visType, 'markers') ? 'SEURAT_TSNEPlot_EachTopGene' : null
        const file = `frontend_example_mac_10x_cwl_res${resolution}.${vis}.png`
        res.sendFile(`${runPath}/${file}`)
      })
    }
  )

  app.get(
    '/download',
    (req, res) => {
      console.log(req.query)
      const {runId} = req.query
      const zip = new AdmZip()
      zip.addLocalFolder(`/Users/smohanra/Documents/crescent/docker-crescent/${runId}/SEURAT`)
      zip.writeZip('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip')
      res.download('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip', `${runId}.zip`)
    }
  )

  app.get(
    '/test',
    (req, res) => {
      console.log(req.query)
      res.send('some string')
    }
  )



  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}


db.once('open', () => {
  connection.open()  
})
