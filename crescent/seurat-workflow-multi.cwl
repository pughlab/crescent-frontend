class: Workflow
cwlVersion: v1.0

inputs:
  - id: anchors_function
    type: string?

  - id: reference_datasets
    type: string?
        
  - id: resolution
    type: float?

  - id: project_id
    type: string

  - id: pca_dimensions
    type: int?

  - id: return_threshold
    type: float?

  - id: dge_comparisons
    type: string?

  - id: number_cores
    type: string?

  - id: save_filtered_data
    type: string
    default: N

  - id: save_r_object
    type: string
    default: N

  - id: save_unfiltered_data
    type: string
    default: N

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
      - id: R_file
      - id: runs_dir
    run: ./extract-multi.cwl
  - id: seurat-v3
    in:
      - id: runs_dir
        source: extract/runs_dir
      
      - id: R_script
        source: extract/R_file

      - id: sc_input
        source: extract/datasets

      - id: anchors_function
        source: anchors_function

      - id: reference_datasets
        source: reference_datasets

      - id: resolution
        source: resolution

      - id: project_id
        source: project_id

      - id: pca_dimensions
        source: pca_dimensions

      - id: return_threshold
        source: return_threshold

      - id: dge_comparisons
        source: dge_comparisons

      - id: number_cores
        source: number_cores

      - id: save_filtered_data
        source: save_filtered_data

      - id: save_r_object
        source: save_r_object

      - id: save_unfiltered_data
        source: save_unfiltered_data

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
