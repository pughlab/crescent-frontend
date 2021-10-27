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
  datasets:
    type: File
    outputBinding:
      glob: ["run-*/datasets.csv"]
  R_file_QC_Normalization:
    type: File
    outputBinding:
      glob: ["run-*/Runs_Seurat_v4_MultiDatasets_QC_Normalization.R"]
  R_file_Integration:
    type: File
    outputBinding:
      glob: ["run-*/Runs_Seurat_v4_MultiDatasets_Integration.R"]
  R_file_PCA_Clustering:
    type: File
    outputBinding:
      glob: ["run-*/Runs_Seurat_v4_MultiDatasets_PCA_Clustering_DimReduction.R"]
  R_file_DGE:
    type: File
    outputBinding:
      glob: ["run-*/Runs_Seurat_v4_MultiDatasets_DGE.R"]
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