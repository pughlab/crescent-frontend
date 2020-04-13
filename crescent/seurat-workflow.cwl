class: Workflow
cwlVersion: v1.0

inputs:
  - id: R_script
    type: File
  
  - id: R_dir
    type: Directory

  - id: sc_input_type
    type: string

  - id: resolution
    type: float?

  - id: project_id
    type: string

  - id: summary_plots
    type: string?

  - id: colour_tsne_discrete
    type: File?

  - id: list_genes
    type: string?

  - id: opacity
    type: float?

  - id: pca_dimensions
    type: int?

  - id: percent_mito
    type: string?

  - id: number_genes
    type: string?

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
    type: string

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
    run: ./extract.cwl
  - id: seurat-v3
    in:
      - id: R_script
        source: R_script

      - id: R_dir
        source: R_dir

      - id: sc_input
        source: extract/input_dir

      - id: sc_input_type
        source: sc_input_type

      - id: resolution
        source: resolution

      - id: project_id
        source: project_id

      - id: summary_plots
        source: summary_plots

      - id: colour_tsne_discrete
        source: colour_tsne_discrete

      - id: list_genes
        source: list_genes

      - id: opacity
        source: opacity

      - id: pca_dimensions
        source: pca_dimensions

      - id: percent_mito
        source: percent_mito

      - id: number_genes
        source: number_genes

      - id: return_threshold
        source: return_threshold

      - id: number_cores
        source: number_cores

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir
    out:
      - id: seurat_output
    run: ./seurat-v3.cwl
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
