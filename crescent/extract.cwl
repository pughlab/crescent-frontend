class: CommandLineTool
cwlVersion: v1.0
hints:
  DockerRequirement:
    dockerPull: minio/mc
  EnvVarRequirement:
    envDef: 
      MC_HOST_minio: http://$(inputs.access):$(inputs.secret)@$(inputs.domain):$(inputs.port)
baseCommand: cp
inputs:
  - id: minioInputPath
    type: string[]
  - id: access
    type: string
  - id: secret
    type: string
  - id: domain
    type: string
  - id: port
    type: string
outputs:
  input_dir:
    type: Directory[]
    outputBinding:
      glob: ["dataset-*/"]
  R_file:
    type: File
    outputBinding:
      glob: ["run-*/Runs*"]
  runs_dir:
    type: Directory
    outputBinding:
      glob: ["run-*/"]
arguments:
  - position: 1
    prefix: ''
    separate: false
    valueFrom: --recursive
  - position: 2
    prefix: ''
    separate: false
    valueFrom: $(inputs.minioInputPath)
  - position: 3
    prefix: ''
    separate: false
    valueFrom: "."