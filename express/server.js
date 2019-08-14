const submitCWL = require('./submit')

const R = require('ramda')

// Servers
const autobahn = require('autobahn')
const connection = new autobahn.Connection({ url: 'ws://crossbar:4000/', realm: 'realm1' })
const express = require('express')
const cors = require('cors')
// MINIO
const Minio = require('minio')
// Multer to handle multi form data
const multer = require('multer')
const upload = multer({ dest: '/Users/smohanra/Desktop/crescentMockup/express/tmp/express' })
// Zip
const AdmZip = require('adm-zip')

// MongoDB
// const db = require('./database')
const mongooseConnection = require('../database/mongo')
const db = mongooseConnection.connection

const fs = require('fs')
const path = require('path')

const Run = db.model('run')

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
  // session
  //   .register(
  //     'crescent.submit',
  //     (args, kwargs) => {
  //       const d = new autobahn.when.defer()
  //       console.log('RUN YOUR CWL COMMAND HERE, workflow arguments in kwargs variable')
  //       console.log(kwargs)
  //       Run.create({params: JSON.stringify(kwargs) },
  //         (err, run) => {
  //           if (err) {console.log(err)}
  //           // console.log(run)
  //           const {runId} = run
  //           submitCWL(kwargs, session, runId)
  //           d.resolve(run)
  //         }
  //       )
  //       return d.promise
  //     }
  //   )
  //   .then(
  //     reg => console.log('Registered: ', reg.procedure),
  //     err => console.error('Registration error: ', err)
  //   )
  // session
  //   .register(
  //     'crescent.runs',
  //     (args, kwargs) => {
  //       return fetchRuns()
  //       // const d = new autobahn.when.defer()
  //       // d.resolve(fetchRuns())
  //       // return d.promise

  //     }
  //   )
  //   .then(
  //     reg => console.log('Registered: ', reg.procedure),
  //     err => console.error('Registration error: ', err)
  //   )

  // Start node server for HTTP stuff
  const app = express()
  const port = 4001
  // Method for submitting a CWL job
  app.post(
    '/submit',
    async (req, res) => {
      console.log(req.query)
      // Assign `params` as stringified kwargs
      const {kwargs: params} = req.query
      const run = await Run.create({params})
      // Parse and pass as object of parameters
      const kwargs = JSON.parse(params)
      const {runId} = run
      submitCWL(kwargs, session, runId)
      res.sendStatus(200)
    }
  )
  // Method for fetching all runs
  app.get(
    '/runs',
    async (req, res) => {
      const runs = await Run.find({})
      res.json(runs)
    }
  )

  app.put(
    '/upload/barcodes',
    upload.single('uploadedFile'),
    (req, res, next) => {
      // File that needs to be uploaded.
      const file = req.file
      // console.log(file)
      const metaData = {
        'Content-Type': 'application/octet-stream',
        'X-Amz-Meta-Testing': 1235,
        'example': 5678
      }
      // Using fPutObject API upload your file to the bucket
      minioClient.fPutObject(bucketName, 'barcodes.tsv.gz', file.path, metaData, function(err, etag) {
        if (err) return console.log(err, etag)
        console.log('File uploaded successfully.')
        // Publish to upload notification channel when MinIO done
        // Do this for each file you need
        minioClient.fGetObject('crescent', 'barcodes.tsv.gz', `${minioPath}/barcodes.tsv.gz`,
          err => {
            if (err) { return console.log(err) }
            console.log('File successfully downloaded')
            session.publish('crescent.upload', [], { uploadedFilePath: etag })
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
      minioClient.fPutObject(bucketName, 'features.tsv.gz', file.path, metaData, function (err, etag) {
        if (err) return console.log(err, etag)
        console.log('File uploaded successfully.')
        // Download file from bucket so that CWL will have access
        minioClient.fGetObject('crescent', 'features.tsv.gz', `${minioPath}/features.tsv.gz`,
          err => {
            if (err) { return console.log(err) }
            console.log('File successfully downloaded')
            session.publish('crescent.upload', [], { uploadedFilePath: etag })
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
      minioClient.fPutObject(bucketName, 'matrix.mtx.gz', file.path, metaData, function (err, etag) {
        if (err) return console.log(err, etag)
        console.log('File uploaded successfully.')
        // Publish to upload notification channel when MinIO done
        minioClient.fGetObject('crescent', 'matrix.mtx.gz', `${minioPath}/matrix.mtx.gz`,
          err => {
            if (err) { return console.log(err) }
            console.log('File successfully downloaded')
            session.publish('crescent.upload', [], { uploadedFilePath: etag })
          }
        )

      })
      res.sendStatus(200)
    }
  )

  // TODO: remove
  app.get(
    '/result',
    (req, res) => {
      const { runId, visType } = req.query
      Run.findOne({ runId }, (err, run) => {
        if (err) { console.log(err) }
        console.log(run)
        const { runId, params } = run
        const { resolution } = JSON.parse(params)
        console.log(runId, resolution)
	//const runPath = `/Users/smohanra/Documents/crescent/docker-crescent/${runId}/SEURAT`
        const runPath = `/usr/src/app/results/${runId}/SEURAT` 
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
      const { runId } = req.query
      const zip = new AdmZip()
      //zip.addLocalFolder(`/Users/smohanra/Documents/crescent/docker-crescent/${runId}/SEURAT`)
      //zip.writeZip('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip')
      //res.download('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip', `${runId}.zip`)
      zip.addLocalFolder(`/usr/src/app/results/${runId}/SEURAT`)
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



  app.get("/tsne", (req, res) => {
    // faking this for now cuz I don't know where the files are written and can't test
    // just grabbing local files
    const { runId } = req.query
    const readFiles = (callback) => {
      let cell_clusters = [] // store list of clusters with the coordinates of the cells
      fs.readFile(path.resolve(`/usr/src/app/results/${runId}/SEURAT/frontend_example_mac_10x_cwl_res1.SEURAT_TSNECoordinates.tsv`), "utf8", (err, contents) => {
          if (err) {res.send(err);}
          else{
              // put coords into 2d array
              let coords = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
              coords.shift(); // discard header
              // read in other file
              fs.readFile(path.resolve(`/usr/src/app/results/${runId}/SEURAT/frontend_example_mac_10x_cwl_res1.SEURAT_CellClusters.tsv`), "utf-8", (err, contents) => {
                  if (err) {res.send(err);}
                  else{
                      // put the cell cluster labels into an object
                      cluster_dict = {}
                      labels = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)));
                      labels.shift(); // discard header
                      coords.forEach((barcode) => {
                          let idx = labels.find(k => k[0]==barcode[0])
                          barcode_cluster = "cluster_" + String(idx[1]);
                          if(barcode_cluster in cluster_dict){
                              // append existing cluster with coords
                              cluster_dict[barcode_cluster]['x'].push(parseFloat(barcode[1]));
                              cluster_dict[barcode_cluster]['y'].push(parseFloat(barcode[2]));
                          }
                          else{
                              cluster_dict[barcode_cluster] = {
                                  'name': barcode_cluster,
                                  'mode': 'markers',
                                  'x': [parseFloat(barcode[1])],
                                  'y': [parseFloat(barcode[2])]
                              }
                          }
                      }
                      )
                      cell_clusters = R.values(cluster_dict);
                      const sortByCluster = R.sortBy(R.compose(R.toLower, R.prop('name')))
                      cell_clusters = sortByCluster(cell_clusters)
                      callback(cell_clusters);
                  }
              })
          }
      });
  }
  cell_clusters = readFiles((data) => {res.send(JSON.stringify(data));})
  })



  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

db.once('open', () => {
  console.log('Database connection open')
  connection.open()
})
mongooseConnection.connect('mongodb://mongo/crescent', {useNewUrlParser: true})

/*
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

  // Gene data model
  const GeneSchema = new mongoose.Schema({
    HGNC_ID: String,
    Approved_symbol: String,
    Approved_name: String,
    Previous_symbols: String,
    Synonyms: String,
    Chromosome: String,
    Accession_numbers: String,
    RefSeq_IDs: String,  
    Ensembl_gene_ID: String, 
    NCBI_Gene_ID: String, 
    Name_synonyms: String,
    OMIMID: String
  })
  const Gene = db.model('gene', GeneSchema)
  
  // create the gene collection if it's empty
  Gene.findOne({},
    (err, gene) => {
      if (err) return console.log("Error with Gene schema: " + err); 
      else if (!gene) {
        // no genes in schema, insert them
        fs.readFile(path.resolve(__dirname, 'hgnc_genes.tsv'), "utf8", (err, contents) => {
          if (err) return console.log(err)
          else {
            // remove trailing newline and put tab delimited lines into 2d array            
            lines = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
            head = R.map(String, lines.shift())
            // replace omim name if in exported file
            replace = head.indexOf('OMIM ID(supplied by OMIM)')
            if (replace != -1) { head[replace] = "OMIMID"; }
            head = R.map(R.replace(/\s/g, '\_'), head);
            result = R.map(R.zipObj(head), lines);
            console.log(result[result.length -1]);
            Gene.insertMany(result, 
              (err, docs) => {
                if (err) return console.log(err);
                else console.log("Successfully inserted %d gene records", docs.length);
                // only open connection after genes are inserted
                connection.open()
              }); // end of insertMany
            }
          }); // end of readFile
        }
      else {
        console.log("Gene collection already exists, skipping creation");
        // no need to create collection, just open connection
        connection.open()
        }
    }); // end of findOne
}); //end of db.once 
*/
