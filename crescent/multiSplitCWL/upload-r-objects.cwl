class: CommandLineTool
cwlVersion: v1.0
hints:
  DockerRequirement:
    dockerPull: minio/mc
  EnvVarRequirement:
    envDef: 
      MC_HOST_minio: https://$(inputs.access):$(inputs.secret)@$(inputs.domain):$(inputs.port)
baseCommand: cp
inputs:
  - id: R_OBJECTS_CWL
    type: Directory
  - id: destinationPath
    type: string
  - id: access
    type: string
  - id: secret
    type: string
  - id: domain
    type: string
  - id: port
    type: string
outputs:
  R_OBJECTS_CWL_dir:
    type: string
    outputBinding:
      outputEval: $(inputs.R_OBJECTS_CWL.location)
arguments:
  - position: 1
    prefix: ''
    separate: false
    valueFrom: --recursive
  - position: 2
    prefix: ''
    separate: false
    valueFrom: $(inputs.R_OBJECTS_CWL)
  - position: 3
    prefix: ''
    separate: false
    valueFrom: $(inputs.destinationPath)/