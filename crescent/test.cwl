cwlVersion: v1.0

class: CommandLineTool

requirements:
  DockerRequirement:
    dockerPull: crescentdev/crescent-v3:latest

baseCommand: [tail]
inputs:
  R_script:
    type: File
  sc_input:
    type: Directory
  R_dir:
    type: Directory
outputs: []
arguments: ["-f", "/bin/ls"]
