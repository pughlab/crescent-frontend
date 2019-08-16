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
const process = require('process')
const zlib = require('zlib');
const jsonQuery = require('json-query');
const async = require('async');

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
            res.sendStatus(200)
          }
        )
      })
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
            res.sendStatus(200)
          }
        )
      })
      
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
            res.sendStatus(200)
          }
        )

      })
    }
  )

  app.get(
    '/result',
    (req, res) => {
      const { runId, visType } = req.query
      if (visType == 'tsne'){
        res.json('unavailable'); // blank response to prevent error
      }
      Run.findOne({ runId }, (err, run) => {
        if (err) { console.log(err) }
        console.log(run)
        const { runId, params } = run
        const { resolution } = JSON.parse(params)
        console.log(runId, resolution)
	//const runPath = `/Users/smohanra/Documents/crescent/docker-crescent/${runId}/SEURAT`
        const runPath = `/usr/src/app/results/${runId}/SEURAT` 
        const vis = R.equals(visType, 'pca') ? 'SEURAT_PCElbowPlot' : R.equals(visType, 'markers') ? 'SEURAT_TSNEPlot_EachTopGene' : null
        const file = `frontend_example_mac_10x_cwl.${vis}.png`
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


  app.get('/search/features/:searchInput',
    (req, res) => {
      let emptyResult = [{'text': ''}];
      const searchInput = req.params.searchInput;
      let jsonObj = '';
      // check if json of file exists, create it from zipped file if not
      if (! fs.existsSync('./features.json')) {
        const fileContents = fs.createReadStream('./features.tsv.gz');
        const writeStream = fs.createWriteStream('./features.tsv');
        const unzip = zlib.createGunzip();
        let stream = fileContents.pipe(unzip).pipe(writeStream)
            stream.on('finish', () => {
                // put unzipped file into json
                fs.readFile('./features.tsv', 'utf-8', (err, contents) => {
                    if (err) {return console.log(err);}
                    else{
                        // convert contents to 2d-array
                        features = R.map(R.split("\t"), R.split("\n", contents));
                        jsonObj = R.map(R.zipObj(['ENSID', 'Symbol', 'Expression']), features)
                        jsonObj = {"data": jsonObj}
                        // write json for future use
                        fs.writeFile("features.json", JSON.stringify(jsonObj), 'utf8', (err) => {
                            if (err) {return console.log(err);}
                            else{
                              let result = []
                              let query = jsonQuery(`data[*Symbol~/^${searchInput}/i]`, {data: jsonObj, allowRegexp: true}).value;
                              if (query.length == 0){
                                res.send(emptyResult);
                              }
                              else {
                                query = (query.length > 5) ? query.slice(0,5) : query; // only return max of 5 results
                                const formatResult = x => result.push({'text': x['Symbol'], 'value': x['ENSID']});
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
          jsonObj = JSON.parse(fs.readFileSync("./features.json", 'utf-8'));
          let result = []
          let query = jsonQuery(`data[*Symbol~/^${searchInput}/i]`, {data: jsonObj, allowRegexp: true}).value;
          if (query.length == 0){res.send(emptyResult);}
          else {
            query = (query.length > 5) ? query.slice(0,5) : query; // only return max of 5 results
            const formatResult = x => result.push({'text': x['Symbol'], 'value': x['ENSID']});
            R.forEach(formatResult, query);
            res.send(JSON.stringify(result)); 
          }
      }
    }
  );


  app.get('/search/genes/:searchInput',
    (req, res) => {
      let emptyResult = [{'text': ''}];
      const searchInput = req.params.searchInput;
      let searchRegex = new RegExp(searchInput);
      // relaxed search on gene symbol, exact search on ensembl id
      Gene.find({ $or:[ {'Approved_symbol': {$regex: searchRegex, $options: 'i'}}, {'HGNC_ID': searchInput}, {'Ensembl_gene_ID': searchInput}]},
      (err, docs) => {
        if (err) { console.log(err); res.send(emptyResult);}
        // check if anything was found
        if (docs && docs.length > 0) {
          docs = (docs.length > 5) ? docs.slice(0,5) : docs; // max 5 returned
          let searchResult = []
          const formatResult = x=> searchResult.push({'text': x['Approved_symbol'], 'description': x['Approved_name'], 'value': x['HGNC_ID']});
          R.forEach(formatResult, docs);
          res.json(searchResult);
        }
        else{res.send(emptyResult);}
      });
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

  app.get(
    '/tsne/:runID', 
    (req, res) => {
    const runId = req.params.runID
    const readFiles = (callback) => {
      let cell_clusters = [] // store list of clusters with the coordinates of the cells
      fs.readFile(path.resolve(`/usr/src/app/results/${runId}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_TSNECoordinates.tsv`), "utf8", (err, contents) => {
          if (err) {res.send(err);}
          else{
              // put coords into 2d array
              let coords = R.map(R.split("\t"), R.split("\n", contents.slice(0,-1)))
              coords.shift(); // discard header
              // read in other file
              fs.readFile(path.resolve(`/usr/src/app/results/${runId}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_CellClusters.tsv`), "utf-8", (err, contents) => {
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
                              cluster_dict[barcode_cluster]['text'].push(barcode[0]);
                          }
                          // create new entry for the cluster
                          else{cluster_dict[barcode_cluster] = {'name': barcode_cluster, 'mode': 'markers','x': [parseFloat(barcode[1])],'y': [parseFloat(barcode[2])], 'text': [barcode[0]]};}
                      })
                      cell_clusters = R.values(cluster_dict);
                      const sortByCluster = R.sortBy(R.compose(R.toLower, R.prop('name')))
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
    fs.writeFile(`/usr/src/app/results/${runId}/clusters.json`, JSON.stringify(data), 'utf8', (err) => console.log(err))
  })
});



//TODO: finish this
app.get('/norm-counts/:runID/:feature',
  (req, res) => {
    const queryFeature = req.params.feature;
    const runID = req.params.runID;
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
          if (String(unquote(line[0])) == String(queryFeature)){
            found = true;
            // open up the file that categorizes the cells into clusters based on barcode
            fs.readFile(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_CellClusters.tsv`, 'utf-8',
              (err, clusterFile) => {
                if (err) {res.send(err); return;}
                clusters = R.map(R.split("\t"), R.split("\n", clusterFile)); 
                header = clusters.shift();
                // ok now we want to knit these 2d arrays together
                for(cell in clusters){



                }
              }
            )
          }
        }

      }
    )
  }
);

app.get(
  '/expression/:runID/:feature',
  (req, res) => {
    const queryFeature = req.params.feature;
    const runID = req.params.runID;
    // extract normalized expression for every barcode
    fs.readFile(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_log10_count_matrix.tsv`, 'utf-8',
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
            normCounts = R.zip(barcodes, line.slice(1));
            // open up the file that categorizes the cells into clusters based on barcode
            fs.readFile(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_CellClusters.tsv`, 'utf-8',
              (err, clusterFile) => {
                if (err) {res.send(err); return;}
                // put into 2d array (remove trailing newline)
                clusters = R.map(R.split("\t"), R.split("\n", clusterFile.slice(0,-1))); 
                headers = clusters.shift();
                const sortByFirst = R.sortBy(R.prop(0));
                normCounts = sortByFirst(normCounts);
                clusters = sortByFirst(clusters);
                let x = [];
                let y = []; 
                console.log(normCounts)
                console.log(clusters)
                for(i = 0; i < Math.min(normCounts.length, clusters.length); i++){
                    if (normCounts[i][0] != clusters[i][0]){
                        console.log("Error: different set of cells in clusters and Normalized count files");
                        return
                    }
                    else{
                        x.push(clusters[i][1]);
                        y.push(+(parseFloat(normCounts[i][1]).toFixed(2)));
                    }
                }
                let data = [{
                    type: 'violin',
                    x: x,
                    y: y,
                    meanline: {visible: true}
                }]
                console.log(data);
                res.send(JSON.stringify(data));
             }
            )
          }
        }

      }
    )
});
  
app.get(
    '/opacity/:runID/:feature',
    (req, res) => {
      const queryFeature = req.params.feature;
      const runID = req.params.runID;
      // given a feature name, extract the normalized expression for each cell (barcode)
      fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_log10_count_matrix.tsv`), "utf8", 
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
              console.log('found');
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
                    console.log('Complete');
                    res.send(obj);
                  }
                  }); 
              });                            
            }
        }
        if (! found){
          // send blank
          console.log('Feature not found');
          res.send(result)
          return
        }
      });
   });

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

db.once('open', () => {
  console.log('Database connection open')
  connection.open()
})
mongooseConnection.connect('mongodb://mongo/crescent', {useNewUrlParser: true})

