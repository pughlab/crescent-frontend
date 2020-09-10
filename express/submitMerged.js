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
    // const {datasetIDs} = await Run.findOne({runID})
    const run = await Run.findOne({runID})
    const {datasetIDs, parameters} = run
    // const datasetID 

    // const {
    //   // singleCell,
    //   // numberGenes: {min: minNumberGenes, max: maxNumberGenes},
    //   // percentMito: {min: minPercentMito, max: maxPercentMito},
    //   // datasetsQualityControl,
    //   resolution,
    //   principalDimensions,
    //   normalizationMethod,
    //   returnThreshold,
    // } = params

    const {
      quality, 
      // normalization: {normalization_method}, 
      reduction: {pca_dimensions}, 
      clustering: {resolution}, 
      expression: {
        return_threshold,
        dge_comparisons,
      },
      save: {
        save_unfiltered_data,
        save_filtered_data,
        save_r_object,
      },
    } = parameters
  
    // const {
    //   save_unfiltered_data,
    //   save_filtered_data,
    //   save_r_object,
    // } = save


    const seuratMultiSampleParameters = {
      resolution,
      project_id: 'crescent',
      pca_dimensions,
      // normalization_method,
      return_threshold,
      dge_comparisons: R.gt(R.length(dge_comparisons), 1) ? R.join(',', dge_comparisons) : dge_comparisons,
      save_unfiltered_data,
      save_filtered_data,
      save_r_object,
    }

    // Make datasets csv
    const datasets = R.compose(

      R.map(
        ({datasetID, name}) => { 
          const {
            sc_input_type,
            percent_mito: {min: minPercentMito, max: maxPercentMito},
            percent_ribo: {min: minPercentRibo, max: maxPercentRibo},
            number_genes: {min: minNumberGenes, max: maxNumberGenes},
            number_reads: {min: minNumberReads, max: maxNumberReads},
          } = quality[datasetID]
          return {
            dataset_ID: `dataset-${datasetID.toString()}`,
            name,
            dataset_type: 'type',
            dataset_format: sc_input_type,
            // add experiment_type here etc
            mito_min: minPercentMito,
            mito_max: maxPercentMito,
            // ribo_min: '0',
            // ribo_max: '0.75',
            ribo_min: minPercentRibo,
            ribo_max: maxPercentRibo,
            ngenes_min: minNumberGenes,
            ngenes_max: maxNumberGenes,
            // nreads_min: '1',
            // nreads_max: '80000',
            nreads_min: minNumberReads,
            nreads_max: maxNumberReads,
          }
        }
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
    const minioPath = '/usr/src/app/minio/upload/'
    const cwlDatasetDirectoryInput = datasetID => ({class: 'Directory', path: `${minioPath}/dataset-${datasetID}`})
    const minio_path = R.compose(R.map(cwlDatasetDirectoryInput), R.keys)(quality)

    // pipeline JSON config
    return {
      R_script: {
        class: 'File',
        path: '/usr/src/app/crescent/Script/Runs_Seurat_v3_MultiDatasets.R'
      },
      sc_input: {
        class: 'File',
        path: `/usr/src/app/minio/upload/run-${runID}/datasets.csv`
      },
      // minio_path: [
      //   // {class: 'Directory', path: '/usr/src/app/minio/upload/dataset-5f11070c67691b0288e8fc3d'},
      //   // {class: 'Directory', path: '/usr/src/app/minio/upload/dataset-5f11071d67691b0288e8fc40'},
      //   {class: 'Directory', path: '/usr/src/app/minio/upload'},
      // ],
      minio_path,
      ...seuratMultiSampleParameters,
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
  console.log(jobJSON)
  const cwl = spawn(
    `export TMPDIR=/Users/smohanra/Desktop/crescentMockup/tmp && \
     cd /usr/src/app/minio/upload/run-${runID} && \
     cp /usr/src/app/crescent/Script/Runs_Seurat_v3_MultiDatasets.R /usr/src/app/minio/upload/run-${runID} && \
     rm -f frontend_seurat_inputs.json && \
     echo '${JSON.stringify(jobJSON)}' >> frontend_seurat_inputs.json && \
     toil-cwl-runner \
        --writeLogs \
        /usr/src/app/minio/upload/run-${runID}  \
        --maxLogFileSize \
        0 \
        --singularity \
        /usr/src/app/crescent/integrate-seurat-v3.cwl \
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

module.exports = submitMergedCWL
