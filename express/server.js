const submitCWL = require('./submit')

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
const db = require('./database')
const mongoose = require('mongoose')

const fs = require('fs')
const path = require('path')
const process = require('process')
const zlib = require('zlib');
const jsonQuery = require('json-query');

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

  // populate the Gene collection if it's empty
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
            Gene.insertMany(result, 
              (err, docs) => {
                if (err) return console.log(err);
                else console.log("Successfully inserted %d gene records", docs.length);
              }); // end of insertMany
            }
          }); // end of readFile
        }
      else {
        console.log("Gene collection already exists, skipping creation");
        }
    }); // end of findOne
  

  // Register method to run example
  session
    .register(
      'crescent.submit',
      (args, kwargs) => {
        const d = new autobahn.when.defer()
        console.log('RUN YOUR CWL COMMAND HERE, workflow arguments in kwargs variable')
        console.log(kwargs)
        Run.create({params: JSON.stringify(kwargs) },
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
                                res.send(result); 
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
            res.send(result); 
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
  cell_clusters = readFiles((data) => {res.send(JSON.stringify(data));})
  })

  app.get(
    '/norm-counts/:runID/:feature',
    (req, res) => {
    const queryFeature = req.params.feature;
    const runID = req.params.runID;
    console.log(queryFeature);
    console.log(runID);
    // given a feature name, extract the normalized expression for each cell (barcode)
    fs.readFile(path.resolve(`/usr/src/app/results/${runID}/SEURAT/frontend_example_mac_10x_cwl.SEURAT_normalized_count_matrix.tsv`), "utf8", (err, contents) => {
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
          console.log('here');
          res.send(R.zip(barcodes,line.slice(1)));
          return
        }
    }
    if (! found){
      res.send(result)
      return
    }
    
   });
})

  

  app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}

db.once('open', () => {
   connection.open()
})

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
