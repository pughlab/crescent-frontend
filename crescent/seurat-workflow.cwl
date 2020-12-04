class: Workflow
cwlVersion: v1.0

inputs:
  - id: sc_input_type
    type: string

  - id: resolution
    type: float?

  - id: project_id
    type: string

  - id: colour_tsne_discrete
    type: File?

  - id: list_genes
    type: string?

  - id: pca_dimensions
    type: int?

  - id: normalization_method
    type: string?
  
  - id: apply_cell_filters
    type: string
    default: Y

  - id: percent_mito
    type: string?
  
  - id: percent_ribo
    type: string?

  - id: number_genes
    type: string?
  
  - id: number_reads
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

  - id: save_filtered_data
    type: string
    default: N

  - id: save_r_object
    type: string
    default: N

  - id: save_unfiltered_data
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
      - id: R_file
      - id: runs_dir
    run: ./extract.cwl
  - id: seurat-v3
    in:
      - id: runs_dir
        source: extract/runs_dir
        
      - id: R_script
        source: extract/R_file

      - id: sc_input
        source: extract/input_dir

      - id: sc_input_type
        source: sc_input_type

      - id: resolution
        source: resolution

      - id: project_id
        source: project_id

      - id: colour_tsne_discrete
        source: colour_tsne_discrete

      - id: list_genes
        source: list_genes

      - id: pca_dimensions
        source: pca_dimensions

      - id: normalization_method
        source: normalization_method

      - id: apply_cell_filters
        source: apply_cell_filters

      - id: percent_mito
        source: percent_mito
      
      - id: percent_ribo
        source: percent_ribo

      - id: number_genes
        source: number_genes

      - id: number_reads
        source: number_reads

      - id: return_threshold
        source: return_threshold

      - id: number_cores
        source: number_cores

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

      - id: save_filtered_data
        source: save_filtered_data

      - id: save_r_object
        source: save_r_object

      - id: save_unfiltered_data
        source: save_unfiltered_data
      
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
