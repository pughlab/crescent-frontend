// Method for running toil-cwl-runner
'use strict'

const fs = require('fs')
const fsp = fs.promises
const R = require('ramda')
const { spawn } = require( 'child_process' )

const { Run, Project, Dataset } = require('../database/mongo');

const minioClient = require('../database/minio-client');

const jsonexport = require('jsonexport')

// Make object to write as CWL job JSON file
const makeCWLJobJSON = async (
  // {
  //   // singleCell,
  //   // numberGenes: {min: minNumberGenes, max: maxNumberGenes},
  //   // percentMito: {min: minPercentMito, max: maxPercentMito},
  //   datasetsQualityControl,
  //   resolution,
  //   principalDimensions,
  //   normalizationMethod,
  //   returnThreshold,
  // },
  runID,
) => {
  try {
    // Put files from project's dataset into system
    const {params, datasetIDs} = await Run.findOne({runID})
    const {
      // singleCell,
      // numberGenes: {min: minNumberGenes, max: maxNumberGenes},
      // percentMito: {min: minPercentMito, max: maxPercentMito},
      datasetsQualityControl,
      resolution,
      principalDimensions,
      normalizationMethod,
      returnThreshold,
    } = params
    // Make datasets csv
    const datasets = R.compose(

      R.map(
        ({datasetID, name}) => ({
          dataset_path: `/usr/src/app/minio/upload/dataset-${datasetID.toString()}`,
          name,
          // add experiment_type here etc
          ... R.prop(datasetID, datasetsQualityControl),

          //
          // dummyProperty: someValue
        })
      )
    )(
      await Dataset.find({datasetID: {$in: datasetIDs}})
    )

    // Need to turn this array of objects into csv with headers for 'sc_input' cwl param
    // [name, dataset_path, experiment_type, sc_input_type,  ...qc_params]
    // Write datasets.csv for quality control and sc_input
    try {
      await new Promise(
        (resolve, reject) => jsonexport(
          datasets,
          (err, csv) => {
            if (err) {
              reject(err)
              return console.log('Dataset quality control submit error', err)
            } else {
              // Put into Minio
              minioClient.putObject(`run-${runID}`, 'datasets.csv', csv, 
                (err, etag) => {
                  if (err) {
                    console.log('dataset quality control minio error', err)
                  } else {
                    resolve()
                  }
                }
              )
            }
          }
        )
      )  
    } catch(error) {
      console.log('Error putting datasets.csv into bucket')
    }

    // pipeline JSON config
    return {
      R_script: {
        class: 'File',
        path: '/usr/src/app/crescent/Runs_Seurat_v3.R'

      },

      // DONT NEED FOR MERGED
      // sc_input: {
      //   class: 'Directory',
      //   // path: `/usr/src/app/minio/download/${projectID}`
      //   path: runDirFilePath

      // },
      // sc_input_type: singleCell, //'MTX', // change to singleCell eventually if supporting seurat v2
      // percent_mito: `${minPercentMito},${maxPercentMito}`,
      // number_genes: `${minNumberGenes},${maxNumberGenes}`

      resolution,
      project_id: 'crescent',
      summary_plots: 'n',
      pca_dimensions: principalDimensions,
      normalization_method: normalizationMethod,
      return_threshold: returnThreshold,
    }
  } catch(error) {
    console.error('Make job json error', error)
  }
}


// GETTING SINGULARITY IMAGE ERROR

const submitMergedCWL = async (
  runID
) => {
  const run = await Run.findOne({runID})
  const jobJSON = await makeCWLJobJSON(runID)
  // const jobJSON = await makeCWLJobJSON(kwargs, runID)
  // console.log(jobJSON)
  // const cwl = spawn(
  //   `export TMPDIR=/Users/smohanra/Desktop/crescentMockup/tmp && \
  //    mkdir /usr/src/app/results/${runID} && \
  //    cd /usr/src/app/results/${runID} && \
  //    rm -f frontend_seurat_inputs.json && \
  //    echo '${JSON.stringify(jobJSON)}' >> frontend_seurat_inputs.json && \
  //    toil-cwl-runner \
  //       --writeLogs \
  //       /usr/src/app/results/${runID} \
  //       --maxLogFileSize \
  //       0 \
  //       --singularity \
  //       /usr/src/app/crescent/seurat-v3.cwl \
  //       frontend_seurat_inputs.json \ 
  //   `,
  //     { 
  //       shell: true
  //     }
  // )
  // run.submittedOn = new Date()
  // await run.save()
  // cwl.stdout.on( 'data', data => {
  //     console.log( `stdout: ${data}` )
  //     // console.log(data)
  // })
  // cwl.stderr.on( 'data', data => {
  //     console.log( `stderr: ${data}` )
  // })
  // cwl.on( 'close', code => {
  //     console.log( `child process exited with code ${code}`)
  //     const isErrorCode = R.compose(R.not, R.equals(0))
  //     run.status = isErrorCode(code) ? 'failed' : 'completed'
  //     run.completedOn = new Date()
  //     run.save()
  // })
}

module.exports = submitMergedCWL
