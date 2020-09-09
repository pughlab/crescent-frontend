// Method for running toil-cwl-runner aaaaaaa
'use strict'

const fs = require('fs')
const fsp = fs.promises
const R = require('ramda')
const { spawn } = require( 'child_process' )

const { Run, Project, Dataset } = require('../database/mongo');

const minioClient = require('../database/minio-client');

// Make object to write as CWL job JSON file
const makeCWLJobJSON = async (
  // {
  //   datasetsQualityControl,
  //   resolution,
  //   principalDimensions,
  //   normalizationMethod,
  //   applyCellFilters,
  //   returnThreshold,
  // },
  runID,
) => {
  try {
    // const {
    //   singleCell,
    //   numberGenes: {min: minNumberGenes, max: maxNumberGenes},
    //   percentMito: {min: minPercentMito, max: maxPercentMito},
    // } = R.compose(
    //   R.head,
    //   R.values
    // )(datasetsQualityControl)

    // Put files from project's dataset into system
    const run = await Run.findOne({runID})

    // get parameters and destructure from run document 
    const {datasetIDs, parameters} = run
    const [datasetID] = datasetIDs 

    const dataset = await Dataset.findOne({datasetID})
    const {name} = dataset


    const {
      quality, 
      normalization: {normalization_method}, 
      reduction: {pca_dimensions}, 
      clustering: {resolution}, 
      expression: {return_threshold},
      save: {
        save_unfiltered_data,
        save_filtered_data,
        save_r_object,
      },
    } = parameters

    const {
      sc_input_type,
      apply_cell_filters,
      percent_mito: {min: minPercentMito, max: maxPercentMito},
      percent_ribo: {min: minPercentRibo, max: maxPercentRibo},
      number_genes: {min: minNumberGenes, max: maxNumberGenes},
      number_reads: {min: minNumberReads, max: maxNumberReads},
    } = quality[datasetID]

    // const {
    //   save_unfiltered_data,
    //   save_filtered_data,
    //   save_r_object,
    // } = save

    const seuratSingleSampleParameters = {
      sc_input_type, //'MTX', // change to singleCell eventually if supporting seurat v2
      resolution,
      project_id: name,
      pca_dimensions,
      normalization_method,
      return_threshold,

      // add to db schema later 
      apply_cell_filters,

      percent_mito: `${minPercentMito},${maxPercentMito}`,
      percent_ribo: `${minPercentRibo},${maxPercentRibo}`,
      number_genes: `${minNumberGenes},${maxNumberGenes}`,
      number_reads: `${minNumberReads},${maxNumberReads}`,
      
      save_unfiltered_data,
      save_filtered_data,
      save_r_object,
    }

    // const project = await Project.findOne({projectID})
    // const {datasetID} = project
    // const dataset = await Dataset.findOne({datasetID})
    // const {barcodesID, featuresID, matrixID} = dataset

    // Run files path
    // const runDirFilePath = `/usr/src/app/minio/download/${runID}`

    // // Make project directory and put data files there
    // await fsp.mkdir(runDirFilePath)
    // const copyObjectToFile = async (uploadID, fileName) => {
    //   await minioClient.fGetObject(
    //     // From datasets bucket
    //     `dataset-${datasetID}`,
    //     // with object name/ID
    //     `${uploadID}`, 
    //     // put into local file system for pipeline
    //     R.join('/', [runDirFilePath, fileName])
    //   )
    // }
    // await copyObjectToFile(barcodesID, 'barcodes.tsv.gz')
    // await copyObjectToFile(featuresID, 'features.tsv.gz')
    // await copyObjectToFile(matrixID, 'matrix.mtx.gz')

    const datasetBucketPath = `/usr/src/app/minio/upload/dataset-${datasetID}`

    // pipeline JSON config
    return {
      R_script: {
        class: 'File',
        path: '/usr/src/app/crescent/Script/Runs_Seurat_v3_SingleDataset.R' 
      },
      sc_input: {
        class: 'Directory',
         path: datasetBucketPath
      },
      // R_dir: {
      //   class: 'Directory',
      //   path: 'Script'
      // },

      ...seuratSingleSampleParameters,

      // minioInputPath: `minio/project-${projectID}/inputs/`,
      // destinationPath: `minio/project-${projectID}/runs/${runID}`,
      // access_key: `crescent-access`,
      // secret_key: `crescent-secret`,
      // minio_domain: `host.docker.internal`,
      // minio_port: `9000`
    }
  } catch(error) {
    console.error('Make job json error', error)
  }
}

// GETTING SINGULARITY IMAGE ERROR

const submitCWL = async (
  runID
) => {
  const run = await Run.findOne({runID})
  const jobJSON = await makeCWLJobJSON(runID)
  console.log(jobJSON)
  const cwl = spawn(
    // `export TMPDIR=/Users/smohanra/Desktop/crescentMockup/tmp && \
    //  mkdir /usr/src/app/results/${runID} && \
    //  cp /usr/src/app/crescent/Runs_Seurat_v3.R /usr/src/app/results/${runID} && \
    //  cd /usr/src/app/results/${runID} && \
    //  rm -f frontend_seurat_inputs.json && \
    //  echo '${JSON.stringify(jobJSON)}' >> frontend_seurat_inputs.json && \
    //  python3 \
    //     /usr/src/app/express/python/WesCall.py \
    //     /usr/src/app/results/${runID} \
    //     /usr/src/app/minio/download/${runID} \
    // `,
    `export TMPDIR=/Users/smohanra/Desktop/crescentMockup/tmp && \
    cd /usr/src/app/minio/upload/run-${runID} && \
    cp /usr/src/app/crescent/Script/Runs_Seurat_v3_SingleDataset.R /usr/src/app/minio/upload/run-${runID} && \
    rm -f frontend_seurat_inputs.json && \
    echo '${JSON.stringify(jobJSON)}' >> frontend_seurat_inputs.json && \
    toil-cwl-runner \
       --writeLogs \
       /usr/src/app/minio/upload/run-${runID}  \
       --maxLogFileSize \
       0 \
       --singularity \
       /usr/src/app/crescent/seurat-v3-non-wes.cwl \
       frontend_seurat_inputs.json \ 
   `,
      { 
        shell: true
      }
  )
  run.submittedOn = new Date()
  await run.save()
  cwl.stdout.on( 'data', data => {
      console.log( `stdout: ${data}` )
      // console.log(data)
  })
  cwl.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` )
  })
  cwl.on( 'close', code => {
      console.log( `child process exited with code ${code}`)
      const isErrorCode = R.compose(R.not, R.equals(0))
      run.status = isErrorCode(code) ? 'failed' : 'completed'
      run.completedOn = new Date()
      run.save()
  })
}

module.exports = submitCWL
