// Method for running toil-cwl-runner
'use strict'

const fs = require('fs')
const fsp = fs.promises
const R = require('ramda')
const { spawn } = require( 'child_process' )

const { Run, Project, Dataset } = require('../database/mongo');

const minioClient = require('../database/minio-client');

// Make object to write as CWL job JSON file
const makeCWLJobJSON = async (
  {
    singleCell,
    numberGenes: {min: minNumberGenes, max: maxNumberGenes},
    percentMito: {min: minPercentMito, max: maxPercentMito},
    // percentRibo: {min: minPercentRibo, max: maxPercentRibo},
    resolution,
    principalDimensions,
    normalizationMethod,
    applyCellFilters,
    returnThreshold,
  },
  runID,
) => {
  try {
    // Put files from project's dataset into system
    const run = await Run.findOne({runID})
    const {projectID} = run
    const project = await Project.findOne({projectID})
    const {datasetID} = project
    const dataset = await Dataset.findOne({datasetID})
    const {barcodesID, featuresID, matrixID} = dataset

    // Run files path
    const runDirFilePath = `/usr/src/app/minio/download/Run-${runID}`

    // Make project directory and put data files there
    await fsp.mkdir(runDirFilePath)
    const copyObjectToFile = async (uploadID, fileName) => {
      await minioClient.fGetObject(
        // From project bucket
        `project-${projectID}`,
        // with object name/ID
        `${uploadID}`, 
        // put into local file system for pipeline
        R.join('/', [runDirFilePath, fileName])
      )
    }
    await copyObjectToFile(barcodesID, 'barcodes.tsv.gz')
    await copyObjectToFile(featuresID, 'features.tsv.gz')
    await copyObjectToFile(matrixID, 'matrix.mtx.gz')

    // pipeline JSON config
    return {
      R_script: {
        class: 'File',
        // path: '/usr/src/app/crescent/Runs_Seurat_v3.R' //Changed to conform with wes staging
        path: 'Runs_Seurat_v3.R' 
      },
      sc_input: {
        class: 'Directory',
        // path: `/usr/src/app/minio/download/${projectID}`
        // path: runDirFilePath
         path: `minio/download/Run-${runID}`
      },
      sc_input_type: singleCell, //'MTX', // change to singleCell eventually if supporting seurat v2
      resolution,
      project_id: 'crescent',
      summary_plots: 'n',
      pca_dimensions: principalDimensions,
      normalization_method: normalizationMethod,
      return_threshold: returnThreshold,
      apply_cell_filters: applyCellFilters,
      // percent_mito: '0,0.2', // v2: 'Inf,0.05',
      percent_mito: `${minPercentMito},${maxPercentMito}`,
      // percent_ribo: `${minPercentRibo},${maxPercentRibo}`,
      // number_genes: '50,8000',
      number_genes: `${minNumberGenes},${maxNumberGenes}`
    }
  } catch(error) {
    console.error('Make job json error', error)
  }
}


// GETTING SINGULARITY IMAGE ERROR

const submitCWL = async (
  kwargs,
  runID
) => {
  const run = await Run.findOne({runID})
  const jobJSON = await makeCWLJobJSON(kwargs, runID)
  console.log(jobJSON)
  const cwl = spawn(
    `export TMPDIR=/Users/smohanra/Desktop/crescentMockup/tmp && \
     mkdir /usr/src/app/results/${runID} && \
     cp /usr/src/app/crescent/Runs_Seurat_v3.R /usr/src/app/results/${runID} && \
     cd /usr/src/app/results/${runID} && \
     rm -f frontend_seurat_inputs.json && \
     echo '${JSON.stringify(jobJSON)}' >> frontend_seurat_inputs.json && \
     python3 \
        /usr/src/app/express/python/Test.py \
        /usr/src/app/results/${runID} \
        /usr/src/app/minio/download/Run-${runID} \
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
