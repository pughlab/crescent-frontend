// Method for running toil-cwl-runner
'use strict'

const R = require('ramda')

const { spawn } = require( 'child_process' )

// Make object to write as CWL job JSON file
const makeCWLJobJSON = (
  {
    singleCell,
    resolution,
    principalDimensions,
  },
  projectID,
  runID
) => ({
  R_script: {
    class: 'File',
    path: '/usr/src/app/crescent/CWL_Runs_Seurat_v3.R'

  },
  sc_input: {
    class: 'Directory',
    path: `/usr/src/app/minio/download/${projectID}`

  },
  sc_input_type: singleCell, //'MTX', // change to singleCell eventually if supporting seurat v2
  resolution,
  project_id: 'frontend_example_mac_10x_cwl',
  summary_plots: 'n',
  pca_dimensions: principalDimensions,
  percent_mito: '0,0.2', // v2: 'Inf,0.05',
  number_genes: '50,8000',
})

const submitCWL = (
  kwargs,
  projectID,
  runID,
  session
) => {
  console.log(runID)
  const jobJSON = makeCWLJobJSON(kwargs, projectID, runID)
  const cwl = spawn(
    `export TMPDIR=/Users/smohanra/Desktop/crescentMockup/tmp && \
     mkdir /usr/src/app/results/${runID} && \
     cd /usr/src/app/results/${runID} && \
     rm -f frontend_seurat_inputs.json && \
     echo '${JSON.stringify(jobJSON)}' >> frontend_seurat_inputs.json && \
     toil-cwl-runner \
        --debug \
        --singularity \
        /usr/src/app/crescent/seurat-v3.cwl \
        frontend_seurat_inputs.json \ 
    `,
      { 
        shell: true
      }
  )
  cwl.stdout.on( 'data', data => {
      console.log( `stdout: ${data}` )
      console.log(data)
  })
  cwl.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` )
  })
  cwl.on( 'close', code => {
      console.log( `child process exited with code ${code}` )
      session.publish('crescent.result', [], {runID})
  })
}

module.exports = submitCWL
