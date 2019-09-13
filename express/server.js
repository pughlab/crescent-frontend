const submitCWL = require('./submit')

const R = require('ramda')

// Servers
const express = require('express')
// MINIO
const Minio = require('minio')
// Multer to handle multi form data
const multer = require('multer')
const upload = multer({ dest: '/usr/src/app/minio/upload' })
// Zip
const AdmZip = require('adm-zip')
const jStat = require('jStat')

const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const zlib = require('zlib')
const jsonQuery = require('json-query')
const firstline = require('firstline')

const autobahn = require('autobahn')
const connection = new autobahn.Connection({ url: 'ws://crossbar:4000/', realm: 'realm1' })

// Mongo connection
const mongooseConnection = require('../database/mongo')
const db = mongooseConnection.connection
// Mongo collections
const Run = db.model('run')
const Project = db.model('project')
const Upload = db.model('upload')

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
minioClient.makeBucket('temporary', 'us-east-1', function(err) {
  if (err) return console.log(err)
  console.log('Bucket created successfully in "us-east-1".')
})
const bucketName = 'crescent'
const minioPath = '/usr/src/app/minio/download'

const colours = [
  '#1f77b4',  // muted blue
  '#ff7f0e',  // safety orange
  '#2ca02c',  // cooked asparagus green
  '#d62728',  // brick red
  '#9467bd',  // muted purple
  '#8c564b',  // chestnut brown
  '#e377c2',  // raspberry yogurt pink
  '#7f7f7f',  // middle gray
  '#bcbd22',  // curry yellow-green
  '#17becf'   // blue-teal
]
  

connection.onopen = (session) => {

// Start node server for HTTP stuff
const app = express()
const port = 4001

// API endpoint called by GQL to submit a job
app.post(
  '/runs/submit/:runID',
  async (req, res) => {
    const {
      params: {runID},
      query: {name, params}
    } = req
    const run = await Run.findOne({runID})
    const { projectID } = run
    // // Parse and pass as object of parameters
    const kwargs = JSON.parse(params)
    submitCWL(kwargs, projectID, runID, session)
    res.sendStatus(200)
  }
)

// API endpoint for temporary uploading files
app.put(
  '/upload/:kind',
  upload.single('uploadedFile'),
  async (req, res, next) => {
    // File that needs to be uploaded.
    const {
      params: {kind}, // 'barcodes', 'genes', 'matrix'
      file: {path: filePath}
    } = req
    // Upload type
    // Create temporary directory inside minio if doesn't exist
    const upload = await new Upload()
    console.log('upload', upload)
    const {uploadID} = upload
    // const tempDirPath = `${minioPath}/temp`
    // try {
    //   await fsp.stat(tempDirPath)
    // } catch (err) {
    //   await fsp.mkdir(tempDirPath)
    // }
    // res.sendStatus(200)
    const metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1235,
      'example': 5678
    }
    // Using fPutObject API upload your file to the bucket
    minioClient.fPutObject('temporary', `${uploadID}`, filePath, metaData, function(err, etag) {
      if (err) return console.log(err, etag)
      console.log('File uploaded successfully.')
      res.json(uploadID)
      // minioClient.fGetObject('temporary', `${uploadID}`, `${tempDirPath}/${uploadID}`,
      //   err => {
      //     if (err) { return console.log(err) }
      //     console.log('File successfully downloaded')
      //   }
      // )
    })
  } 
)

// API endpoint for uploading files given a projectID
app.put(
  '/projects/:projectID/upload/barcodes',
  upload.single('uploadedFile'),
  async (req, res, next) => {
    // File that needs to be uploaded.
    const {
      params: {projectID},
      file: {path: filePath}
    } = req
    const project = await Project.findOne({projectID})
    // Create project directory inside minio if doesn't exist
    const projectDirPath = `${minioPath}/${projectID}`
    try {
      await fsp.stat(projectDirPath)
    } catch (err) {
      await fsp.mkdir(projectDirPath)
    }
    const metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1235,
      'example': 5678
    }
    // Using fPutObject API upload your file to the bucket
    minioClient.fPutObject(bucketName, 'barcodes.tsv.gz', filePath, metaData, function(err, etag) {
      if (err) return console.log(err, etag)
      console.log('File uploaded successfully.')
      // Do this for each file you need to check
      // TODO: remove?
      minioClient.fGetObject(bucketName, 'barcodes.tsv.gz', `${projectDirPath}/barcodes.tsv.gz`,
        err => {
          if (err) { return console.log(err) }
          console.log('File successfully downloaded')
          res.sendStatus(200)
        }
      )
    })
  }
)
app.put(
  '/projects/:projectID/upload/genes',
  upload.single('uploadedFile'),
  async (req, res, next) => {
    // File that needs to be uploaded.
    const {
      params: {projectID},
      file: {path: filePath}
    } = req
    const project = await Project.findOne({projectID})
    // Create project directory inside minio if doesn't exist
    const projectDirPath = `${minioPath}/${projectID}`
    try {
      await fsp.stat(projectDirPath)
    } catch (err) {
      await fsp.mkdir(projectDirPath)
    }
    const metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1235,
      'example': 5678
    }
    // Using fPutObject API upload your file to the bucket
    minioClient.fPutObject(bucketName, 'features.tsv.gz', filePath, metaData, function(err, etag) {
      if (err) return console.log(err, etag)
      console.log('File uploaded successfully.')
      // Do this for each file you need to check
      // TODO: remove?
      minioClient.fGetObject(bucketName, 'features.tsv.gz', `${projectDirPath}/features.tsv.gz`,
        err => {
          if (err) { return console.log(err) }
          console.log('File successfully downloaded')
          res.sendStatus(200)
        }
      )
    })
  }
)
app.put(
  '/projects/:projectID/upload/matrix',
  upload.single('uploadedFile'),
  async (req, res, next) => {
    // File that needs to be uploaded.
    const {
      params: {projectID},
      file: {path: filePath}
    } = req
    const project = await Project.findOne({projectID})
    // Create project directory inside minio if doesn't exist
    const projectDirPath = `${minioPath}/${projectID}`
    try {
      await fsp.stat(projectDirPath)
    } catch (err) {
      await fsp.mkdir(projectDirPath)
    }
    const metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1235,
      'example': 5678
    }
    // Using fPutObject API upload your file to the bucket
    minioClient.fPutObject(bucketName, 'matrix.mtx.gz', filePath, metaData, function(err, etag) {
      if (err) return console.log(err, etag)
      console.log('File uploaded successfully.')
      // Do this for each file you need to check
      // TODO: remove?
      minioClient.fGetObject(bucketName, 'matrix.mtx.gz', `${projectDirPath}/matrix.mtx.gz`,
        err => {
          if (err) { return console.log(err) }
          console.log('File successfully downloaded')
          res.sendStatus(200)
        }
      )
    })
  }
)

app.get(
  '/result',
  (req, res) => {
    const { runID, visType } = req.query
    if (visType == 'tsne'){
      res.json('unavailable'); // blank response to prevent error
    }
    Run.findOne({ runID }, (err, run) => {
      if (err) { console.log(err) }
      const { runID, params } = run
      const { resolution } = JSON.parse(params)
//const runPath = `/Users/smohanra/Documents/crescent/docker-crescent/${runID}/SEURAT`
      const runPath = `/usr/src/app/results/${runID}/SEURAT` 
      const vis = R.equals(visType, 'pca') ? 'SEURAT_PCElbowPlot' : R.equals(visType, 'markers') ? 'SEURAT_TSNEPlot_EachTopGene' : R.equals(visType, 'qc') ? 'SEURAT_QC_VlnPlot' : null
      const file = `frontend_example_mac_10x_cwl.${vis}.png`
      res.sendFile(`${runPath}/${file}`)
    })
  }
)

app.get(
  '/download/:runID',
  (req, res) => {
    const runID = req.params.runID
    const zip = new AdmZip()
    //zip.addLocalFolder(`/Users/smohanra/Documents/crescent/docker-crescent/${runID}/SEURAT`)
    //zip.writeZip('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip')
    //res.download('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip', `${runID}.zip`)
    zip.addLocalFolder(`/usr/src/app/results/${runID}/SEURAT`)
    //console.log("DOWNLOAD RUN ID:", runID)
    zip.writeZip('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip')
    res.download('/Users/smohanra/Desktop/crescentMockup/express/tmp/express/test.zip', `${runID}.zip`)
  }
)

  app.get(
    '/metadata/:runID',
    async (req, res) => {
      const {
        params: {runID}
      } = req;
      const metafile = `./results/${runID}/metadata.tsv`
      if (fs.existsSync(metafile)){
        // if there is metadata, read the first line and return the columns
        firstline(metafile)
        .then((data) => {
          let options = R.split('\t', data);
          options.shift();
          res.send(JSON.stringify(options));
        })
      }
      else{
        res.send(JSON.stringify([]));
      }
    })

  app.get('/search/features/:runID/:searchInput',
    async (req, res) => {
      const {
        params: {runID, searchInput}
      } = req;
      let emptyResult = [{'text': ''}];
      let result = []
      const formatResult = x => result.push({'text': x['Symbol'], 'value': x['ENSID']});
      // get the projectID from the run
      const run = await Run.findOne({runID})
      const { projectID } = run
      let jsonObj = '';
    
      /*
      minioClient.fGetObject(projectID, 'features.tsv.gz', `tmp/${projectID}/features.tsv.gz`, (err) => {
          if(err){return console.log(err);}
          else{
            console.log("I'm in.")
          }
        });
      */
      
      // check if json of file exists, create it from zipped file if not
      if (! fs.existsSync(`./results/${runID}/features.json`)) {
        const fileContents = fs.createReadStream(`./minio/download/${projectID}/features.tsv.gz`);
        const writeStream = fs.createWriteStream(`./results/${runID}/features.tsv`);
        const unzip = zlib.createGunzip();
        let stream = fileContents.pipe(unzip).pipe(writeStream)
        stream.on('finish', () => {
            // put unzipped file into json
            fs.readFile(`./results/${runID}/features.tsv`, 'utf-8', (err, contents) => {
                if (err) {return console.log(err);}
                else{
                    // convert contents to 2d-array
                    features = R.map(R.split("\t"), R.split("\n", contents));
                    jsonObj = R.map(R.zipObj(['ENSID', 'Symbol', 'Expression']), features)
                    jsonObj = {"data": jsonObj}
                    // write json for future use
                    fs.writeFile(`./results/${runID}/features.json`, JSON.stringify(jsonObj), 'utf8', (err) => {
                        if (err) {return console.log(err);}
                        else{
                          let result = []
                          let query = jsonQuery(`data[*Symbol~/^${searchInput}/i]`, {data: jsonObj, allowRegexp: true}).value;
                          if (query.length == 0){
                            res.send(emptyResult);
                          }
                          else {
                            query = (query.length > 4) ? query.slice(0,4) : query; // only return max of 4 results console.log(query)
                            R.forEach(formatResult, query);
                            res.send(JSON.stringify(result)); 
                          }
                        }
                    });
                }
            }); 
            }); 
      }
      else {
          jsonObj = JSON.parse(fs.readFileSync(`./results/${runID}/features.json`, 'utf-8'));
          let query = jsonQuery(`data[*Symbol~/^${searchInput}/i]`, {data: jsonObj, allowRegexp: true}).value;
          if (query.length == 0){res.send(emptyResult);}
          else {
            query = (query.length > 4) ? query.slice(0,4) : query; // only return max of 4 results
            R.forEach(formatResult, query);
            res.send(JSON.stringify(result)); 
          }
      }
    }
);

/*
//revisit once minio is persistent
app.get('/search/features/:searchInput',
  (req, res) => {
    minioClient.fGetObject(bucketName, 'features.tsv.gz', `./features.tsv.gz`, (err) => {
      if(err){return console.log(err);}
      else{
        // read the zip archive
        let zip = new AdmZip("./features.tsv.gz");
        let zipEntries = zip.getEntries();
        zipEntries.forEach((zipEntry) => {
          console.log(zipEntry.toString());
        })
      }
    });

  }
);
*/

/*
Given a runID, return the number of cells for the run's project dataset
This is used to determine whether opacity/violins should be shown on the front-end
*/
app.get(
  '/cellcount/:runID',
  async (req, res) => {
    const {
      params: {runID}
    } = req
    const run = await Run.findOne({runID})
    const { projectID } = run
    
    if (! fs.existsSync(`./results/${runID}/cellcount.txt`)){
      const fileContents = fs.createReadStream(`./minio/download/${projectID}/barcodes.tsv.gz`);
      const writeStream = fs.createWriteStream(`./results/${runID}/barcodes.tsv`);
      const unzip = zlib.createGunzip();
      let stream = fileContents.pipe(unzip).pipe(writeStream)
      stream.on('finish', () => {
        // count number of cells, store in text file
        fs.readFile(`./results/${runID}/barcodes.tsv`, 'utf-8', (err, contents) => {
          if (err) { res.send(err); }
          let barcodes = R.split("\n", contents).length;
          fs.writeFile(`./results/${runID}/cellcount.txt`, String(barcodes), (err) => {if (err) console.log(err);})
          res.send(String(barcodes));
          return
        })
      })
    }
    else{
      fs.readFile(`./results/${runID}/cellcount.txt`, 'utf-8', (err, contents) => {
        if (err) { res.send(err); }
        res.send(contents)      
      })
    }
  }
);

app.get(
  '/umapgroups/:runID/:group', 
  async (req, res) => {
    const {
      params: {runID, group}
    } = req
    const readFiles = (callback) => {
      let cell_clusters = [] // store list of clusters with the coordinates of the cells
      fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_UMAPCoordinates.tsv`), "utf8", (err, contents) => {
          if (err) {res.send(err);}
          else{
              // put coords into 2d array
              let coords = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
              coords.shift(); // discard header
              // read in metadata file
              fs.readFile(path.resolve(`/usr/src/app/results/${runID}/metadata.tsv`), "utf-8", (err, contents) => {
                  if (err) {res.send(err);}
                  else{
                      // put the cell cluster labels into an object
                      cluster_dict = {}
                      let labels = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)));
                      let labelIdx = labels[0].indexOf(group)
                      labels.shift(); // discard header
                      coords.forEach((barcode) => {
                          let idx = labels.find(k => k[0]==barcode[0])
                          barcode_cluster = String(idx[labelIdx]);
                          if(barcode_cluster in cluster_dict){
                              // append existing cluster with coords
                              cluster_dict[barcode_cluster]['x'].push(parseFloat(barcode[1]));
                              cluster_dict[barcode_cluster]['y'].push(parseFloat(barcode[2]));
                              cluster_dict[barcode_cluster]['text'].push(barcode[0]);
                          }
                          // create new entry for the cluster
                          else{cluster_dict[barcode_cluster] = {'name': barcode_cluster, 'mode': 'markers','x': [parseFloat(barcode[1])],'y': [parseFloat(barcode[2])], 'text': [barcode[0]]};}
                      })
                      cell_clusters = R.values(cluster_dict);
                      const sortByCluster = R.sortBy(R.compose(parseInt, R.prop('name')))
                      cell_clusters = sortByCluster(cell_clusters)
                      callback(cell_clusters); // callback is to send the data
                  }
              })
          }
      });
}
cell_clusters = readFiles((data) => {
  // send and then write for future use
  res.send(JSON.stringify(data)); 
  fs.writeFile(`/usr/src/app/results/${runID}/umap_${group}.json`, JSON.stringify(data), 'utf8', (err) => console.log(err))
})
});


 app.get(
  '/tsnegroups/:runID/:group', 
  async (req, res) => {
    const {
      params: {runID, group}
    } = req
    const readFiles = (callback) => {
      let cell_clusters = [] // store list of clusters with the coordinates of the cells
      fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_TSNECoordinates.tsv`), "utf8", (err, contents) => {
          if (err) {res.send(err);}
          else{
              // put coords into 2d array
              let coords = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
              coords.shift(); // discard header
              // read in metadata file
              fs.readFile(path.resolve(`/usr/src/app/results/${runID}/metadata.tsv`), "utf-8", (err, contents) => {
                  if (err) {res.send(err);}
                  else{
                      // put the cell cluster labels into an object
                      cluster_dict = {}
                      let labels = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)));
                      let labelIdx = labels[0].indexOf(group)
                      labels.shift(); // discard header
                      coords.forEach((barcode) => {
                          let idx = labels.find(k => k[0]==barcode[0])
                          barcode_cluster = String(idx[labelIdx]);
                          if(barcode_cluster in cluster_dict){
                              // append existing cluster with coords
                              cluster_dict[barcode_cluster]['x'].push(parseFloat(barcode[1]));
                              cluster_dict[barcode_cluster]['y'].push(parseFloat(barcode[2]));
                              cluster_dict[barcode_cluster]['text'].push(barcode[0]);
                          }
                          // create new entry for the cluster
                          else{cluster_dict[barcode_cluster] = {'name': barcode_cluster, 'mode': 'markers','x': [parseFloat(barcode[1])],'y': [parseFloat(barcode[2])], 'text': [barcode[0]]};}
                      })
                      cell_clusters = R.values(cluster_dict);
                      const sortByCluster = R.sortBy(R.compose(parseInt, R.prop('name')))
                      cell_clusters = sortByCluster(cell_clusters)
                      callback(cell_clusters); // callback is to send the data
                  }
              })
          }
      });
}
cell_clusters = readFiles((data) => {
  // send and then write for future use
  res.send(JSON.stringify(data)); 
  fs.writeFile(`/usr/src/app/results/${runID}/${group}.json`, JSON.stringify(data), 'utf8', (err) => console.log(err))
})
});
  app.get(
    '/umap/:runID',
    async (req, res) => {
      const {
        params: {runID}
      } = req
    const readFiles = (callback) => {
      let cell_clusters = [] // store list of clusters with the coordinates of the cells
      fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_UMAPCoordinates.tsv`), "utf8", (err, contents) => {
          if (err) {res.send(err);}
          else{
              // put coords into 2d array
              let coords = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
              coords.shift(); // discard header
              // read in other file
              fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_CellClusters.tsv`), "utf-8", (err, contents) => {
                  if (err) {res.send(err);}
                  else{
                      // put the cell cluster labels into an object
                      cluster_dict = {}
                      labels = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)));
                      labels.shift(); // discard header
                      coords.forEach((barcode) => {
                          let idx = labels.find(k => k[0]==barcode[0])
                          if (! idx){
                            console.log("Problem with barcodes not matching")
                            res.send("ERROR")
                          }
                          barcode_cluster = String(idx[1]);
                          if(barcode_cluster in cluster_dict){
                              // append existing cluster with coords
                              cluster_dict[barcode_cluster]['x'].push(parseFloat(barcode[1]));
                              cluster_dict[barcode_cluster]['y'].push(parseFloat(barcode[2]));
                              cluster_dict[barcode_cluster]['text'].push(barcode[0]);
                          }
                          // create new entry for the cluster
                          else{cluster_dict[barcode_cluster] = {'name': barcode_cluster, 'mode': 'markers','x': [parseFloat(barcode[1])],'y': [parseFloat(barcode[2])], 'text': [barcode[0]]};}
                      })
                      cell_clusters = R.values(cluster_dict);
                      const sortByCluster = R.sortBy(R.compose(parseInt, R.prop('name')))
                      cell_clusters = sortByCluster(cell_clusters)
                      callback(cell_clusters); // callback is to send the data
                  }
              })
          }
      });
    }
    cell_clusters = readFiles((data) => {
      // send and then write for future use
      res.send(JSON.stringify(data)); 
      fs.writeFile(`/usr/src/app/results/${runID}/umap_clusters.json`, JSON.stringify(data), 'utf8', (err) => console.log(err))
    })
  }
)
  app.get(
    '/tsne/:runID', 
    (req, res) => {
    const runID = req.params.runID
    const readFiles = (callback) => {
      let cell_clusters = [] // store list of clusters with the coordinates of the cells
      fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_TSNECoordinates.tsv`), "utf8", (err, contents) => {
          if (err) {res.send(err);}
          else{
              // put coords into 2d array
              let coords = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
              coords.shift(); // discard header
              // read in other file
              fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_CellClusters.tsv`), "utf-8", (err, contents) => {
                  if (err) {res.send(err);}
                  else{
                      // put the cell cluster labels into an object
                      cluster_dict = {}
                      labels = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)));
                      labels.shift(); // discard header
                      coords.forEach((barcode) => {
                          let idx = labels.find(k => k[0]==barcode[0])
                          if (! idx){
                            console.log("Problem with barcodes not matching")
                            res.send("ERROR")
                          }
                          barcode_cluster = String(idx[1]);
                          if(barcode_cluster in cluster_dict){
                              // append existing cluster with coords
                              cluster_dict[barcode_cluster]['x'].push(parseFloat(barcode[1]));
                              cluster_dict[barcode_cluster]['y'].push(parseFloat(barcode[2]));
                              cluster_dict[barcode_cluster]['text'].push(barcode[0]);
                          }
                          // create new entry for the cluster
                          else{cluster_dict[barcode_cluster] = {'name': barcode_cluster, 'mode': 'markers','x': [parseFloat(barcode[1])],'y': [parseFloat(barcode[2])], 'text': [barcode[0]]};}
                      })
                      cell_clusters = R.values(cluster_dict);
                      const sortByCluster = R.sortBy(R.compose(parseInt, R.prop('name')))
                      cell_clusters = sortByCluster(cell_clusters)
                      callback(cell_clusters); // callback is to send the data
                  }
              })
          }
      });
    }
    cell_clusters = readFiles((data) => {
      // send and then write for future use
      res.send(JSON.stringify(data)); 
      fs.writeFile(`/usr/src/app/results/${runID}/clusters.json`, JSON.stringify(data), 'utf8', (err) => console.log(err))
    })
  }
)

// from the broad single cell github: 
// https://github.com/broadinstitute/single_cell_portal_core/blob/f70d2053cd1767968cbcc0e31c4250d185a98942/app/assets/javascripts/kernel-functions.js
const dist = (X) => {
  var iqr = jStat.percentile(X, 0.75) - jStat.percentile(X, 0.25);
  var iqrM = iqr /1.34;
  var std = jStat.stdev(X,true);
  var min = std < iqrM ? std : iqrM;
  if(min === 0) {min = std}
  if(min === 0) {min = Math.abs(X[1])}
  if(min === 0) {min = 1.0}
  return 0.9 * min * Math.pow(X.length, -0.2)
}

app.get(
  '/expressiongroup/:runID/:feature/:group',
  async (req, res) => {
    const {
      params: {runID, feature, group}
    } = req
        // extract normalized expression for every barcode
        fs.readFile(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`, 'utf-8',
        (err, contents) => {
          let result = [];
          if (err) {res.send(err); return;}
          const unquote = (elem) => {return R.replace(/['"]+/g, '', elem);};
          // convert contents to 2d-array
          features = R.map(R.split("\t"), R.split("\n", contents));
          barcodes = R.map(unquote, features.shift());
          let found = false;
          for (const line of features){
            if (String(unquote(line[0])) == String(feature)){
              found = true;
              // zip the barcodes with the feature line
              let normCounts = R.zip(barcodes, line.slice(1));
              // open up the file that categorizes the cells into clusters based on barcode
              fs.readFile(`/usr/src/app/results/${runID}/metadata.tsv`, 'utf-8',
                (err, clusterFile) => {
                  if (err) {res.send(err); return;}
                  // put into 2d array (remove trailing newline)
                  let clusters = R.map(R.split("\t"), R.split("\n", clusterFile.slice(0,-1)));
                  idx = clusters[0].indexOf(group);
                  let subset = [];
                  clusters.forEach((row) => {subset.push([row[0],row[idx]])})
                  headers = subset.shift();
                  const sortByFirst = R.sortBy(R.prop(0));
                  normCounts = sortByFirst(normCounts);
                  clusters = sortByFirst(subset);
                  // TODO: before combining, add a check
                  const combine = (left, right) => {return [right[1], left[0], left[1]]}
                  // this will create a 2d array with the cluster, barcode, and normalized counts
                  let combined = R.zipWith(combine, normCounts, clusters);
                  combined = sortByFirst(combined); // sort by cluster
                  let data = [];
                  // initialize counters
                  let currentCluster = null;
                  let currentViolin = {};
                  let colourIter = -1;
                  let currX = [];
                  let currY = [];
                  let template = {
                    name: '',
                    type: 'violin',
                    spanmode: "hard",
                    fillcolor: '',
                    line: {},
                    points: "jitter",
                    jitter: .85,
                    width: 0.75,
                    meanline: {visible: true}
                  }
                  // create a violin plotly component for every cluster
                  for(i = 0; i < combined.length; i++){
                    if (String(combined[i][0]) != currentCluster || i == combined.length-1){
                        // we're on a new cluster
                        if (currentCluster !== null){
                          // do summary calculations and add the existing cluster's info to the data
                          if (R.sum(R.map(parseFloat, currY)) == 0){currentViolin['type'] = 'box'}       
                          else{currentViolin['bandwidth'] = dist(currY);}
                          currentViolin['x'] = currX;
                          currentViolin['y'] = currY;
                          data.push(currentViolin);
                      }
                      // start a new blank plot element for this cluster
                      currentCluster = String(combined[i][0])
                      currentViolin = {...template}; // copy the template
                      colourIter++;
                      currentViolin['name'] = currentCluster;
                      //currentViolin['fillcolor'] = colours[colourIter%10]; // there are 10 default colours
                      currentViolin['line'] = {color: colours[colourIter%10]}
                      currX = [currentCluster];
                      currY = [combined[i][2]];
                    }
                    // same cluster, just add the data values
                    else{
                      currX.push(currentCluster);
                      currY.push(combined[i][2]);
                    }
                  }
                  //const sortByCluster = R.sortBy(R.compose(R.slice(-1,1), R.prop('name')))
                  //data = sortByCluster(data)
                  //data = sortByCluster(data)
                  //R.map(sortByCluster, data)
                  res.send(JSON.stringify(data));
                }
              )
            }
          }
          if (! found) {
            console.log('Normalized Counts: Feature Not Found')
            res.send(result)
          }
        }
      )

  }
);

app.get(
  '/availablePlots/:runID',
  async (req, res) => {
    const {
      params: {runID}
    } = req
    const plotTypes = ['TSNE','UMAP','BISNE'];
    let plots = [];
    plotTypes.forEach(plot => {
      if (fs.existsSync(`./results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_${plot}Coordinates.tsv`)){
        plots.push(plot);
      }
    });
    // violin always available
    plots.push('Violin')
    res.send(plots)
  }
)

app.get(
  '/expression/:runID/:feature',
  (req, res) => {
    const queryFeature = req.params.feature;
    const runID = req.params.runID;
    // extract normalized expression for every barcode given the feature
    fs.readFile(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`, 'utf-8',
      (err, contents) => {
        let result = [];
        if (err) {res.send(err); return;}
        const unquote = (elem) => {return R.replace(/['"]+/g, '', elem);};
        // convert contents to 2d-array
        features = R.map(R.split("\t"), R.split("\n", contents));
        barcodes = R.map(unquote, features.shift());
        let found = false;
        for (const line of features){
          if (String(unquote(line[0])) == String(queryFeature)){
            found = true;
            // zip the barcodes with the feature line
            let normCounts = R.zip(barcodes, line.slice(1));
            // open up the file that categorizes the cells into clusters based on barcode
            fs.readFile(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_CellClusters.tsv`, 'utf-8',
              (err, clusterFile) => {
                if (err) {res.send(err); return;}
                // put into 2d array (remove trailing newline)
                let clusters = R.map(R.split("\t"), R.split("\n", clusterFile.slice(0,-1))); 
                headers = clusters.shift();
                const sortByFirst = R.sortBy(R.prop(0));
                normCounts = sortByFirst(normCounts);
                clusters = sortByFirst(clusters);
                // TODO: before combining, add a check
                const combine = (left, right) => {return [Number(right[1]), left[0], left[1]]}
                // this will create a 2d array with the cluster, barcode, and normalized counts
                let combined = R.zipWith(combine, normCounts, clusters);
                combined = sortByFirst(combined); // sort by cluster
                let data = [];
                // initialize counters
                let currentCluster = null;
                let currentViolin = {};
                let colourIter = -1;
                let currX = [];
                let currY = [];
                let template = {
                  name: '',
                  type: 'violin',
                  spanmode: "hard",
                  fillcolor: '',
                  line: {},
                  points: "jitter",
                  jitter: .85,
                  width: 0.75,
                  meanline: {visible: true}
                }
                // create a violin plotly component for every cluster
                for(i = 0; i < combined.length; i++){
                  if (String(combined[i][0]) != currentCluster || i == combined.length-1){
                      // we're on a new cluster
                      if (currentCluster !== null){
                        // do summary calculations and add the existing cluster's info to the data
                        if (R.sum(R.map(parseFloat, currY)) == 0){currentViolin['type'] = 'box'}       
                        else{currentViolin['bandwidth'] = dist(currY);}
                        currentViolin['x'] = currX;
                        currentViolin['y'] = currY;
                        data.push(currentViolin);
                    }
                    // start a new blank plot element for this cluster
                    currentCluster = String(combined[i][0])
                    currentViolin = {...template}; // copy the template
                    colourIter++;
                    currentViolin['name'] = currentCluster;
                    //currentViolin['fillcolor'] = colours[colourIter%10]; // there are 10 default colours
                    currentViolin['line'] = {color: colours[colourIter%10]}
                    currX = [currentCluster];
                    currY = [combined[i][2]];
                  }
                  // same cluster, just add the data values
                  else{
                    currX.push(currentCluster);
                    currY.push(combined[i][2]);
                  }
                }
                res.send(JSON.stringify(data));
              }
            )
          }
        }
        if (! found) {
          console.log('Normalized Counts: Feature Not Found')
          res.send(result)
        }
      }
    )
  }
);

app.get(
  '/opacitygroupumap/:runID/:feature/:group',
  async (req, res) => {
    const {
      params: {runID, feature, group}
    } = req
    // given a feature name, extract the normalized expression for each cell (barcode)
    fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`), "utf8", 
    (err, contents) => {
      let result = [];
      if (err) {res.send(err); return;}
      // will need to unquote barcodes and features
      const unquote = (elem) => {return R.replace(/['"]+/g, '', elem);};
      // convert contents to 2d-array
      features = R.map(R.split("\t"), R.split("\n", contents));
      // grab barcodes and unquote them
      barcodes = R.map(unquote, features.shift());
      let found = false
      for (const line of features){
          // unquote the featuregroup
          line[0] = unquote(line[0]);
          // if matches, zip with barcodes and return
          if (String(line[0]) == String(feature)){
            // open up the json file to append the opacities
            found = true
            fs.readFile(`/usr/src/app/results/${runID}/umap_${group}.json`,"utf-8", (err, jsonContents) => {
              obj = JSON.parse(jsonContents);
              let counts = line.slice(1);
              // divide by max, multiply by .90 and add .10 to derive opacities (0.1 - 1.0 scale)
              let max = 0;
              let min = 0.05
              counts.forEach(count => {
                if(count != '-Inf' & count > max){max = parseFloat(count);}
              });
              opacityMap = R.zip(barcodes, R.map((c) => ((c*.9/max) + min).toFixed(2), counts));
              let clustersParsed = 0;
              // knit them together
              obj.forEach((itm) => {
                // for each cluster, fill in the opacities of the marker
                let orderedOpacities = [];
                let barcodesParsed = 0;
                itm['text'].forEach(barcode => {
                  barcodesParsed++;
                  opacityMap.filter((map) => {
                    if(map[0] == barcode){
                      if (map[1] != 'NaN'){
                        orderedOpacities.push(map[1]);
                      }
                      else{
                        orderedOpacities.push(min);
                      }
                    }
                  });
                  if (barcodesParsed == itm['text'].length){
                    itm['marker'] = {'opacity': orderedOpacities}
                    clustersParsed++;
                  }
                });
                  if (clustersParsed == obj.length){
                  console.log('Complete');
                  res.send(obj);
                }
                }); 
            });                            
          }
      }
      if (! found){
        // send blank
        console.log('Opacity: feature not found');
        res.send(result)
        return
      }
    });
  }
);

app.get(
  '/opacitygroup/:runID/:feature/:group',
  async (req, res) => {
    const {
      params: {runID, feature, group}
    } = req
    // given a feature name, extract the normalized expression for each cell (barcode)
    fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`), "utf8", 
    (err, contents) => {
      let result = [];
      if (err) {res.send(err); return;}
      // will need to unquote barcodes and features
      const unquote = (elem) => {return R.replace(/['"]+/g, '', elem);};
      // convert contents to 2d-array
      features = R.map(R.split("\t"), R.split("\n", contents));
      // grab barcodes and unquote them
      barcodes = R.map(unquote, features.shift());
      let found = false
      for (const line of features){
          // unquote the featuregroup
          line[0] = unquote(line[0]);
          // if matches, zip with barcodes and return
          if (String(line[0]) == String(feature)){
            // open up the json file to append the opacities
            found = true
            fs.readFile(`/usr/src/app/results/${runID}/${group}.json`,"utf-8", (err, jsonContents) => {
              obj = JSON.parse(jsonContents);
              let counts = line.slice(1);
              // divide by max, multiply by .90 and add .10 to derive opacities (0.1 - 1.0 scale)
              let max = 0;
              let min = 0.05
              counts.forEach(count => {
                if(count != '-Inf' & count > max){max = parseFloat(count);}
              });
              opacityMap = R.zip(barcodes, R.map((c) => ((c*.9/max) + min).toFixed(2), counts));
              let clustersParsed = 0;
              // knit them together
              obj.forEach((itm) => {
                // for each cluster, fill in the opacities of the marker
                let orderedOpacities = [];
                let barcodesParsed = 0;
                itm['text'].forEach(barcode => {
                  barcodesParsed++;
                  opacityMap.filter((map) => {
                    if(map[0] == barcode){
                      if (map[1] != 'NaN'){
                        orderedOpacities.push(map[1]);
                      }
                      else{
                        orderedOpacities.push(min);
                      }
                    }
                  });
                  if (barcodesParsed == itm['text'].length){
                    itm['marker'] = {'opacity': orderedOpacities}
                    clustersParsed++;
                  }
                });
                  if (clustersParsed == obj.length){
                  console.log('Complete');
                  res.send(obj);
                }
                }); 
            });                            
          }
      }
      if (! found){
        // send blank
        console.log('Opacity: feature not found');
        res.send(result)
        return
      }
    });
  }
);

app.get(
  '/opacityumap/:runID/:feature',
  (req, res) => {
    const queryFeature = req.params.feature;
    const runID = req.params.runID;
    // given a feature name, extract the normalized expression for each cell (barcode)
    fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`), "utf8", 
    (err, contents) => {
      let result = [];
      if (err) {res.send(err); return;}
      // will need to unquote barcodes and features
      const unquote = (elem) => {return R.replace(/['"]+/g, '', elem);};
      // convert contents to 2d-array
      features = R.map(R.split("\t"), R.split("\n", contents));
      // grab barcodes and unquote them
      barcodes = R.map(unquote, features.shift());
      let found = false
      for (const line of features){
          // unquote the feature
          line[0] = unquote(line[0]);
          // if matches, zip with barcodes and return
          if (String(line[0]) == String(queryFeature)){
            // open up the json file to append the opacities
            found = true
            fs.readFile(`/usr/src/app/results/${runID}/umap_clusters.json`,"utf-8", (err, jsonContents) => {
              obj = JSON.parse(jsonContents);
              let counts = line.slice(1);
              // divide by max, multiply by .90 and add .10 to derive opacities (0.1 - 1.0 scale)
              let max = 0;
              let min = 0.05
              counts.forEach(count => {
                if(count != '-Inf' & count > max){max = parseFloat(count);}
              });
              opacityMap = R.zip(barcodes, R.map((c) => ((c*.9/max) + min).toFixed(2), counts));
              let clustersParsed = 0;
              // knit them together
              obj.forEach((itm) => {
                // for each cluster, fill in the opacities of the marker
                let orderedOpacities = [];
                let barcodesParsed = 0;
                itm['text'].forEach(barcode => {
                  barcodesParsed++;
                  opacityMap.filter((map) => {
                    if(map[0] == barcode){
                      if (map[1] != 'NaN'){
                        orderedOpacities.push(map[1]);
                      }
                      else{
                        orderedOpacities.push(min);
                      }
                    }
                  });
                  if (barcodesParsed == itm['text'].length){
                    itm['marker'] = {'opacity': orderedOpacities}
                    clustersParsed++;
                  }
                });
                  if (clustersParsed == obj.length){
                  res.send(obj);
                }
                }); 
            });                            
          }
      }
      if (! found){
        // send blank
        console.log('Opacity: feature not found');
        res.send(result)
        return
      }
    });
  }
);


app.get(
  '/opacity/:runID/:feature',
  (req, res) => {
    const queryFeature = req.params.feature;
    const runID = req.params.runID;
    // given a feature name, extract the normalized expression for each cell (barcode)
    fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`), "utf8", 
    (err, contents) => {
      let result = [];
      if (err) {res.send(err); return;}
      // will need to unquote barcodes and features
      const unquote = (elem) => {return R.replace(/['"]+/g, '', elem);};
      // convert contents to 2d-array
      features = R.map(R.split("\t"), R.split("\n", contents));
      // grab barcodes and unquote them
      barcodes = R.map(unquote, features.shift());
      let found = false
      for (const line of features){
          // unquote the feature
          line[0] = unquote(line[0]);
          // if matches, zip with barcodes and return
          if (String(line[0]) == String(queryFeature)){
            // open up the json file to append the opacities
            found = true
            fs.readFile(`/usr/src/app/results/${runID}/clusters.json`,"utf-8", (err, jsonContents) => {
              obj = JSON.parse(jsonContents);
              let counts = line.slice(1);
              // divide by max, multiply by .90 and add .10 to derive opacities (0.1 - 1.0 scale)
              let max = 0;
              let min = 0.05
              counts.forEach(count => {
                if(count != '-Inf' & count > max){max = parseFloat(count);}
              });
              opacityMap = R.zip(barcodes, R.map((c) => ((c*.9/max) + min).toFixed(2), counts));
              let clustersParsed = 0;
              // knit them together
              obj.forEach((itm) => {
                // for each cluster, fill in the opacities of the marker
                let orderedOpacities = [];
                let barcodesParsed = 0;
                itm['text'].forEach(barcode => {
                  barcodesParsed++;
                  opacityMap.filter((map) => {
                    if(map[0] == barcode){
                      if (map[1] != 'NaN'){
                        orderedOpacities.push(map[1]);
                      }
                      else{
                        orderedOpacities.push(min);
                      }
                    }
                  });
                  if (barcodesParsed == itm['text'].length){
                    itm['marker'] = {'opacity': orderedOpacities}
                    clustersParsed++;
                  }
                });
                  if (clustersParsed == obj.length){
                  res.send(obj);
                }
                }); 
            });                            
          }
      }
      if (! found){
        // send blank
        console.log('Opacity: feature not found');
        res.send(result)
        return
      }
    });
  }
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}


db.once('open', () => {
  console.log('Database connection open')
  connection.open()
})
mongooseConnection.connect('mongodb://mongo/crescent', {useNewUrlParser: true})

