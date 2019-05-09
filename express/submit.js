// Method for running toil-cwl-runner
'use strict'

const { spawn } = require( 'child_process' )

const submitCWL = () => {
  // const mkdir = spawn( 'mkdir', [ `./testdir` ] )
  // mkdir.stdout.on( 'data', data => {
  //     console.log( `stdout: ${data}` )
  // })
  // mkdir.stderr.on( 'data', data => {
  //     console.log( `stderr: ${data}` )
  // })
  // mkdir.on( 'close', code => {
  //     console.log( `child process exited with code ${code}` )
  // })

  // const echo = spawn( 'echo', [ 'this is where you run your toil-cwl-runner instead of echo' ] )
  // echo.stdout.on( 'data', data => {
  //     console.log( `stdout: ${data}` )
  // })
  // echo.stderr.on( 'data', data => {
  //     console.log( `stderr: ${data}` )
  // })
  // echo.on( 'close', code => {
  //     console.log( `child process exited with code ${code}` )
  // }) 

  const cwl = spawn(
    'cd /Users/smohanra/Documents/crescent/docker-crescent && source /Users/smohanra/Documents/crescent/docker-crescent/crescent/bin/activate && export TMPDIR=/Users/smohanra/Documents/crescent/docker-crescent/tmp && /Users/smohanra/Library/Python/2.7/bin/toil-cwl-runner /Users/smohanra/Documents/crescent/docker-crescent/seurat.cwl /Users/smohanra/Documents/crescent/docker-crescent/seurat_inputs.yaml',{ 
      shell: true

  })
  cwl.stdout.on( 'data', data => {
      console.log( `stdout` )
      console.log(data)
  })
  cwl.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` )
  })
  cwl.on( 'close', code => {
      console.log( `child process exited with code ${code}` )
  })
}

module.exports = submitCWL
