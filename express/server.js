const submitCWL = require('./submit')

const fs = require('fs')
const fsp = fs.promises
const R = require('ramda')
const jsonQuery = require('json-query')
const { spawn } = require("child_process");

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


// Start node server for HTTP stuff
const app = express()
const port = 4001

// API endpoint called by GQL to submit a job
app.post(
  // '/runs/submit/:runID',
  '/runs/submit',
  async (req, res) => {
    const {
      // params: {runID},
      query: {name, params, runID}
    } = req
    // // Parse and pass as object of parameters
    const kwargs = JSON.parse(params)
    submitCWL(kwargs, runID)
    res.sendStatus(200)
  }
);

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
    const {uploadID} = upload
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
    })
  } 
);


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
      const runPath = `/usr/src/app/results/${runID}/SEURAT` 
      const vis = R.equals(visType, 'pca') ? 'SEURAT_PCElbowPlot' : R.equals(visType, 'markers') ? 'SEURAT_TSNEPlot_EachTopGene' : R.equals(visType, 'qc') ? 'SEURAT_QC_VlnPlot' : null
      const file = `frontend_example_mac_10x_cwl.${vis}.png`
      res.sendFile(`${runPath}/${file}`)
    })
  }
);

app.get(
  '/download/:runID',
  async (req, res) => {
    const runID = req.params.runID
    const {name: runName, projectID} = await Run.findOne({runID})
    const {name: projectName} = await Project.findOne({projectID})
    const zip = new AdmZip()
    zip.addLocalFolder(`/usr/src/app/results/${runID}`)
    zip.writeZip(`/usr/src/app/results/${runID}.zip`)
    res.download(`/usr/src/app/results/${runID}.zip`,`${projectName}_${runName}.zip`)
  }
);

// returns promise that resolves on python program exit 
function call_python(program, params){
  const process = spawn('python3', [`/usr/src/app/express/python/${program}`, JSON.stringify(params)]);
  let collected_chunks = '';
  return new Promise((resolve) => {
    // collect chunks until program completes
    process.stdout.on('data', (data) => {collected_chunks += data.toString();});
    process.stdout.on('end', () => {resolve(collected_chunks)});
    // TODO: consider putting catch for stderr of python program and sending to reject
  })
}

/*
put any endpoints for fetching metadata here:
'groups' - available groups to categorize barcodes
'cellcount' - number of (unfiltered) cells for the dataset
*/
app.get(
  '/metadata/:type/:runID',
  (req, res) => {
    const {
      params: {type, runID}
    } = req;
    let python_process = null;
    switch(type) {
      case 'groups':
        python_process = call_python('get_groups.py', {runID});
        python_process.then((result) => {res.send(result)})
        break;
      case 'cellcount':
        python_process = call_python('cellcount.py', {runID});
        python_process.then((result) => {res.send(result)})
        break;
      case 'plots':
        python_process = call_python('get_plots.py', {runID});
        python_process.then((result) => {
          if(! R.isNil(R.prop('error', JSON.parse(result)))){res.status(404)}
          res.send(result)
        })
        break;
      default:
        res.status(404).send("ERROR: invalid metadata endpoint")
    }
  }
);

app.get(
  '/scatter/:vis/:group/:runID',
  (req, res) => {
    const {
      params: {vis, group, runID}
    } = req;
    if (['tsne','bisne','umap'].includes(vis)){
      python_process = call_python('scatter.py', {vis, group, runID});
      python_process.then((result) => {res.send(result);})
    }
    else{
      res.status(500).send("ERROR: unrecognized visualization type")
    }
  }
);

app.get(
  '/opacity/:group/:feature/:runID',
  (req, res) => {
    const {
      params: {group, feature, runID}
    } = req;
    python_process = call_python('opacity.py', {group, feature, runID})
    python_process.then((result) => {res.send(result);})
  }
);

app.get(
  '/violin/:group/:feature/:runID',
  (req, res) => {
    const {
      params: {group, feature, runID}
    } = req;
    python_process = call_python('violin.py', {group, feature, runID})
    python_process.then((result) => {res.send(result);})
  }
);

/*
  currently optimized for node,
  will replace with python if determined to improve speeds
*/
app.get('/search/:query/:runID',
  async (req, res) => {
    const {
      params: {runID, query}
    } = req;
    // define functions/vars
    let result = [];
    const formatResult = x => result.push({'text': x['symbol'], 'value': x['identifier']}); 
    let emptyResult = [{'text': ''}];
    let jsonObj = '';
    // check if json of file exists, create it from features file if not
    if (! fs.existsSync(`/usr/src/app/results/${runID}/SEURAT/raw/features.json`)) {
      fs.readFile(`/usr/src/app/results/${runID}/SEURAT/raw/features.tsv`, 'utf-8', (err, contents) => {
        if (err) {res.send(err);}
        else{
          features = R.map(R.split("\t"), R.split("\n", contents)); // read as 2d array
          jsonObj = R.map(R.zipObj(['identifier', 'symbol', 'expression']), features)
          jsonObj = {"data": jsonObj}
          // write json for future use
          fs.writeFile(`./results/${runID}/raw/features.json`, JSON.stringify(jsonObj), 'utf8', (err) => {
            if (err) {return console.log(err);}
            else{
              let query_result = jsonQuery(`data[*symbol~/^${query}/i]`, {data: jsonObj, allowRegexp: true}).value;
              if (query_result.length == 0) {res.send(emptyResult);}
              else {
                query_result = (query_result.length > 4) ? query_result.slice(0,4) : query_result; // only return max of 4 results
                R.forEach(formatResult, query_result);
                res.send(JSON.stringify(result)); 
              }
            }
          });
        }
      }); 
    }
    else {
        jsonObj = JSON.parse(fs.readFileSync(`/usr/src/app/results/${runID}/SEURAT/raw/features.json`, 'utf-8'));
        let query_result = jsonQuery(`data[*symbol~/^${query}/i]`, {data: jsonObj, allowRegexp: true}).value;
        if (query_result.length == 0){res.send(emptyResult);}
        else {
          query_result = (query_result.length > 4) ? query_result.slice(0,4) : query_result; // only return max of 4 results
          R.forEach(formatResult, query_result);
          res.send(JSON.stringify(result)); 
        }
    }
  }
);


db.once('open', () => {
  console.log('Database connection open')
  app.listen(port, () => console.log(`Express server listening on port ${port}!`));
})

mongooseConnection.connect('mongodb://mongo/crescent', {useNewUrlParser: true})

