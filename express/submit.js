// Method for running toil-cwl-runner
'use strict'

const R = require('ramda')

const { spawn } = require( 'child_process' )

// Make object to write as CWL job JSON file
const makeCWLJobJSON = (
  {
    singleCell,
    resolution,
    genes, // [String]
    opacity,
    principalDimensions,
    returnThreshold
  },
  runID
) => ({
  R_script: {
    class: 'File',
    //path: '/Users/smohanra/Documents/crescent/docker-crescent/Runs_Seurat_Clustering.R'
    //path: 'crescent/Runs_Seurat_Clustering.R'
    path: '/usr/src/app/crescent/CWL_Runs_Seurat_v3.R'

  },
  sc_input: {
    class: 'Directory',
    // path: '/Users/smohanra/Documents/crescent/docker-crescent/filtered_gene_bc_matrices'
    path: '/Users/smohanra/Desktop/crescentMockup/express/tmp/minio'
  },
  sc_input_type: singleCell, //'MTX', // change to singleCell eventually if supporting seurat v2
  resolution,
  project_id: 'frontend_example_mac_10x_cwl',
  summary_plots: 'n',
  list_genes: R.join(',',genes),
  opacity,
  pca_dimensions: principalDimensions,
  percent_mito: '0,0.2', // v2: 'Inf,0.05',
  number_genes: '50,8000',
  return_threshold: returnThreshold,
})

const submitCWL = (
  kwargs,
  runID,
  onCompleted
) => {
  console.log(runID)
  const jobJSON = makeCWLJobJSON(kwargs, runID)
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
      onCompleted()
  })
}

module.exports = submitCWL
