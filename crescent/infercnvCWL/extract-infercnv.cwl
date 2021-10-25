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
  R_file_INFERCNV:
    type: File
    outputBinding:
      glob: ["run-*/Runs_InferCNV.R"]
  cell_type_annotations_input:
    type: File
    outputBinding:
      glob: ["run-*/INFERCNV/INFERCNV_INPUTS/sample_annots.txt"]
  # normal_cell_types_input:
  #   type: File
  #   outputBinding:
  #     glob: ["run-*/INFERCNV/INFERCNV_INPUTS/normalCellTypes.csv"]
  gene_coordinates_input:
    type: File
    outputBinding:
      glob: ["run-*/INFERCNV/INFERCNV_INPUTS/gencode_gene_pos.txt"]                
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