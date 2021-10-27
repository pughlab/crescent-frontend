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
  geneset:
    type: File
    outputBinding:
      glob: ["run-*/GSVA/GSVA_INPUTS/geneset.gmt"]
  R_file_GSVA:
    type: File
    outputBinding:
      glob: ["run-*/Runs_GSVA.R"]
  avg_gene_exp_output:
    type: File
    outputBinding:
      glob: ["run-*/SEURAT/AVERAGE_GENE_EXPRESSION_TABLES/crescent.SEURAT_AverageGeneExpression_GlobalClustering_AllDatasets_SCT.tsv.bz2", "run-*/SEURAT/AVERAGE_GENE_EXPRESSION_TABLES/*_AverageGeneExpressionPerCluster.tsv"]
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