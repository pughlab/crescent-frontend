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
  - id: GSVA
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
  GSVA_dir:
    type: string
    outputBinding:
      outputEval: $(inputs.GSVA.location)
arguments:
  - position: 1
    prefix: ''
    separate: false
    valueFrom: --recursive
  - position: 2
    prefix: ''
    separate: false
    valueFrom: $(inputs.GSVA)
  - position: 3
    prefix: ''
    separate: false
    valueFrom: $(inputs.destinationPath)/