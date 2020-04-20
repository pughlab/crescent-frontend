require('dotenv').config();
const submitCWL = require('./submit')

const fs = require('fs')
const R = require('ramda')
const { spawn } = require("child_process");

// Servers
const mongooseConnection = require('mongoose').connection;
const express = require('express')
// Multer to handle multi form data
const multer = require('multer')
const upload = multer({ dest: '/usr/src/app/minio/upload' })

const recursiveReadDir = require('recursive-readdir');
const jsonQuery = require('json-query')

const { Run, Project, Upload } = require('../database/mongo');
const zipThread = require('./zip');
const minioClient = require('../database/minio-client');
// // Make a bucket called crescent.
// minioClient.makeBucket('crescent', 'us-east-1', function(err) {
//   if (err) return console.log(err)
//   console.log('Bucket created successfully in "us-east-1".')
// })
minioClient.makeBucket('temporary', 'us-east-1', function(err) {
  if (err) return console.log(err)
  console.log('Bucket created successfully in "us-east-1".')
})
// const bucketName = 'crescent'
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
const router = express.Router();
// API endpoint called by GQL to submit a job
router.post(
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
router.put(
  '/upload/:kind',
  upload.single('uploadedFile'),
  async (req, res, next) => {
    try {
      // File that needs to be uploaded.
      const {
        params: {kind}, // 'barcodes', 'genes', 'matrix', 'metadata'
        file: {path: filePath}
      } = req
      // Upload type
      // Should be using `kind` value here to add metadata to Upload document in Mongo
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
        console.log('File uploaded successfully to minio.', uploadID)
        res.json(uploadID)
      })
    } catch(error) {
      console.error(error)
    }
  } 
);

// API endpoint for adding a metadata file currently in temp bucket to project folder
router.put(
  '/projects/:projectID/metadata/:uploadID',
  async (req, res, next) => {
    try {
      const {
        params: {projectID, uploadID}, // 'barcodes', 'genes', 'matrix', 'metadata'
      } = req
      const projectPath = `/usr/src/app/minio/upload/project-${projectID}`
      // NOT NAMING WITH UPLOADID SINCE HILLARY WILL NEED IT TO
      // BE A STANDARD FILE NAME
      const filePath = `${projectPath}/metadata.tsv`
      console.log(projectID, uploadID)
      
      // Using fGetObject API to move to project directory
      minioClient.fGetObject('temporary', `${uploadID}`, filePath, function(err) {
        if (err) return console.log(err)
        console.log('File uploaded successfully to project directory', projectID, uploadID)
        res.json(uploadID)
      })
    } catch(error) {
      console.error(error)
    }
  } 
);


router.get(
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

router.get(
  '/download/:runID',
  async (req, res) => {
    const runID = req.params.runID
    const {name: runName, projectID, downloadable} = await Run.findOne({runID})

    const {name: projectName} = await Project.findOne({projectID})
    const input = `/usr/src/app/results/${runID}`;
    const output = `${input}.zip`;

    if (downloadable){
      try {
        await zipThread(input, output);
        res.download(output, `${projectName}_${runName}.zip`);
      } catch(err) {
        res.sendStatus(500);
      }
    }
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
router.get(
  '/metadata/:type/:runID',
  (req, res) => {
    const {
      params: {type, runID}
    } = req;
    let python_process = null;
    switch(type) {
      case 'groups':
        // use mongoose to get the projectID from the runID
        Run.findOne({'runID': runID}, 'projectID').exec((err, {projectID}) => {
          python_process = call_python('get_groups.py', {runID, projectID});
          python_process.then((result) => {res.send(result)})
        })
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
      case 'qc_metrics':
        python_process = call_python('qc_metrics.py', {runID});
        python_process.then((result) => {
          res.send(result)
        })
        break;
      case 'categorical_groups':
        Run.findOne({'runID': runID}, 'projectID').exec((err, {projectID}) => {
          python_process = call_python('categorical_groups.py', {runID, projectID});
          python_process.then((result) => {res.send(result)})
        })
        break;
      default:
        res.status(404).send("ERROR: invalid metadata endpoint")
    }
  }
);

router.get(
  '/scatter/:vis/:group/:runID',
  (req, res) => {
    const {
      params: {vis, group, runID}
    } = req;
    if (['tsne','bisne','umap'].includes(vis)){
      Run.findOne({'runID': runID}, 'projectID').exec((err, {projectID}) => {
        python_process = call_python('scatter.py', {vis, group, runID, projectID});
        python_process.then((result) => {res.send(result);})
      })
    }
    else{
      res.status(500).send("ERROR: unrecognized visualization type")
    }
  }
);

router.get(
  '/opacity/:group/:feature/:runID',
  (req, res) => {
    const {
      params: {group, feature, runID}
    } = req;
    Run.findOne({'runID': runID}, 'projectID').exec((err, {projectID}) => {
      python_process = call_python('opacity.py', {group, feature, runID, projectID})
      python_process.then((result) => {res.send(result);})
    })
  }
);

router.get(
  '/violin/:group/:feature/:runID',
  (req, res) => {
    const {
      params: {group, feature, runID}
    } = req;
    Run.findOne({'runID': runID}, 'projectID').exec((err, {projectID}) => {
      python_process = call_python('violin.py', {group, feature, runID, projectID})
      python_process.then((result) => {res.send(result);})
    })
  }
);

router.get(
  `/top-expressed/:runID`,
  (req, res) => {
    const {
      params: {runID}
    } = req;
    python_process = call_python('get_top_expressed.py', {runID})
    python_process.then((result) => {res.send(result);})
  }
);

router.get(
  `/available-qc/:runID`,
  (req, res) => {
    const {
      params: {runID}
    } = req;
    python_process = call_python('available_qc_data.py', {runID})
    python_process.then((result) => {res.send(result);})
  }
);

router.get(
  `/qc-data/:runID/:qc_type`,
  (req, res) => {
    const {
      params: {runID, qc_type}
    } = req;
    python_process = call_python('get_qc_data.py', {runID, qc_type})
    python_process.then((result) => {res.send(result);})
  }
);

router.get('/search/:query/:runID',
  async (req, res) => {
    const {
      params: {runID, query}
    } = req;
    // define functions/vars
    let result = [];
    const formatResult = x => result.push({'text': x['symbol'], 'value': x['symbol']}); 
    let emptyResult = [{'text': ''}];
    let jsonObj = '';
    // check if json of file exists, create it from features file if not
    if (! fs.existsSync(`/usr/src/app/results/${runID}/SEURAT/raw/features.json`)) {
      fs.readFile(`/usr/src/app/results/${runID}/SEURAT/raw/features.tsv`, 'utf-8', (err, contents) => {
        if (err) {res.send(err);}
        else{
          features = R.map(R.split("\t"), R.split("\n", contents)); // read as 2d array
          jsonObj = R.map(R.zipObj(['symbol']), features)
          jsonObj = {"data": jsonObj}
          // write json for future use
          fs.writeFile(`./results/${runID}/SEURAT/raw/features.json`, JSON.stringify(jsonObj), 'utf8', (err) => {
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


router.get('/size/:runID', async (req, res) => {
  try {
    // Needs to check 
    const files = await recursiveReadDir(`/usr/src/app/results/${req.params.runID}`);
    let size = 0;
    files.forEach(name => {
      const stat = fs.statSync(name);
      if (stat.isFile()) {
        size += stat.size;
      }
    });
    // res.set('Content-Type', 'text/plain');
    res.send(JSON.stringify({size}));
  } catch(err) {
    if (R.propEq('errno', -2, err)) {
      // Directory doesnt exist send something
      res.send(JSON.stringify({size: 0}))
    } else {
      res.sendStatus(404);
    }
  }
});

app.use("/express", router);

mongooseConnection.once('open', () => {
  app.listen(process.env.EXPRESS_PORT, () => console.log(`Express server listening on port ${process.env.EXPRESS_PORT}!`));
});
