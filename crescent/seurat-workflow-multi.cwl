class: Workflow
cwlVersion: v1.0

inputs:
  - id: R_script
    type: File

  - id: resolution
    type: float?

  - id: project_id
    type: string

  - id: list_genes
    type: string?

  - id: pca_dimensions
    type: int?

  - id: return_threshold
    type: float?

  - id: number_cores
    type: string?

  - id: runs_cwl
    type: string
    default: Y

  - id: outs_dir
    type: string
    default: N

  - id: minioInputPath
    type: string[]

  - id: destinationPath
    type: string

  - id: access_key
    type: string

  - id: secret_key
    type: string

  - id: minio_domain
    type: string

  - id: minio_port
    type: string

outputs: []
steps:
  - id: extract
    in:
      - id: minioInputPath
        source: minioInputPath

      - id: access
        source: access_key

      - id: secret
        source: secret_key
        
      - id: domain
        source: minio_domain

      - id: port
        source: minio_port
    out:
      - id: input_dir
      - id: datasets
    run: ./extract-multi.cwl
  - id: seurat-v3
    in:
      - id: R_script
        source: R_script

      - id: sc_input
        source: extract/datasets

      - id: resolution
        source: resolution

      - id: project_id
        source: project_id

      - id: list_genes
        source: list_genes

      - id: pca_dimensions
        source: pca_dimensions

      - id: return_threshold
        source: return_threshold

      - id: number_cores
        source: number_cores

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

      - id: minio_path
        source: extract/input_dir
    out:
      - id: seurat_output
    run: ./integrate-seurat-v3-wes.cwl
  - id: upload
    in:
      - id: SEURAT
        source: seurat-v3/seurat_output

      - id: destinationPath
        source: destinationPath

      - id: access
        source: access_key

      - id: secret
        source: secret_key
        
      - id: domain
        source: minio_domain

      - id: port
        source: minio_port
    out:
      - id: SEURAT_dir
    run: ./upload.cwl
  - id: clean
    in:
      - id: SEURAT
        source: upload/SEURAT_dir
    out: []
    run: ./clean.cwl
