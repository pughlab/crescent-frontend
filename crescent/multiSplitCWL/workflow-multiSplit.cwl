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

  - id: assays_for_dge
    type: string?

  - id: assays_for_loom
    type: string? 

  - id: number_cores
    type: string?

  - id: save_filtered_data
    type: string
    default: N

  - id: save_r_object
    type: string
    default: Y

  - id: save_unfiltered_data
    type: string
    default: N

  - id: runs_cwl
    type: int
    default: 1

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
  - id: extract-multiSplit
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
      - id: R_file_QC_Normalization
      - id: R_file_Integration
      - id: R_file_PCA_Clustering
      - id: R_file_DGE
      - id: runs_dir
    run: ./extract-multiSplit.cwl
  
  - id: QC-Normalization-multiSplit
    in:
      - id: runs_dir
        source: extract-multiSplit/runs_dir
      
      - id: R_script
        source: extract-multiSplit/R_file_QC_Normalization

      - id: sc_input
        source: extract-multiSplit/datasets

      - id: project_id
        source: project_id

      - id: number_cores
        source: number_cores

      - id: save_filtered_data
        source: save_filtered_data

      - id: save_r_object
        # source: save_r_object
        default: Y

      - id: save_unfiltered_data
        source: save_unfiltered_data

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

      - id: minio_path
        source: extract-multiSplit/input_dir
    out:
      - id: seurat_output
      - id: r_object_output
    run: ./QC-Normalization-multiSplit.cwl

  - id: upload-seurat-QC-Normalization
    in:
      - id: SEURAT
        source: QC-Normalization-multiSplit/seurat_output

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
    run: ./upload-seurat.cwl
    
  - id: Integration-multiSplit
    in:
      - id: runs_dir
        source: extract-multiSplit/runs_dir
      
      - id: R_script
        source: extract-multiSplit/R_file_Integration

      - id: sc_input
        source: extract-multiSplit/datasets

      - id: r_object_input_dir
        source: QC-Normalization-multiSplit/r_object_output   

      - id: anchors_function
        source: anchors_function

      - id: reference_datasets
        source: reference_datasets

      - id: project_id
        source: project_id

      - id: pca_dimensions
        source: pca_dimensions

      - id: number_cores
        source: number_cores

      - id: save_r_object
        # source: save_r_object
        default: Y

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

      - id: minio_path
        source: extract-multiSplit/input_dir
    out:
      - id: seurat_output
      - id: r_object_output
    run: ./Integration-multiSplit.cwl

  - id: upload-seurat-Integration
    in:
      - id: SEURAT
        source: Integration-multiSplit/seurat_output

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
    run: ./upload-seurat.cwl

  - id: PCA-Clustering-multiSplit
    in:
      - id: runs_dir
        source: extract-multiSplit/runs_dir
      
      - id: R_script
        source: extract-multiSplit/R_file_PCA_Clustering

      - id: sc_input
        source: extract-multiSplit/datasets

      - id: r_object_input
        source: Integration-multiSplit/r_object_output   

      - id: resolution
        source: resolution

      - id: project_id
        source: project_id

      - id: pca_dimensions
        source: pca_dimensions

      - id: assays_for_loom
        source: assays_for_loom

      - id: number_cores
        source: number_cores

      - id: save_r_object
        # source: save_r_object
        default: Y

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

      - id: minio_path
        source: extract-multiSplit/input_dir
    out:
      - id: seurat_output
      - id: r_object_output
      - id: loom_output
    run: ./PCA-Clustering-multiSplit.cwl

  - id: upload-seurat-PCA-Clustering
    in:
      - id: SEURAT
        source: PCA-Clustering-multiSplit/seurat_output

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
    run: ./upload-seurat.cwl

  - id: upload-loom-PCA-Clustering
    in:
      - id: LOOM_FILES_CWL
        source: PCA-Clustering-multiSplit/loom_output

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
      - id: LOOM_FILES_CWL_dir
    run: ./upload-loom.cwl

  - id: DGE-multiSplit
    in:
      - id: runs_dir
        source: extract-multiSplit/runs_dir
      
      - id: R_script
        source: extract-multiSplit/R_file_DGE

      - id: sc_input
        source: extract-multiSplit/datasets

      - id: r_object_input
        source: PCA-Clustering-multiSplit/r_object_output   

      - id: project_id
        source: project_id

      - id: return_threshold
        source: return_threshold

      - id: dge_comparisons
        source: dge_comparisons

      - id: assays_for_dge
        source: assays_for_dge

      - id: number_cores
        source: number_cores

      - id: save_r_object
        source: save_r_object

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

      - id: minio_path
        source: extract-multiSplit/input_dir
    out:
      - id: seurat_output
      - id: r_object_output
    run: ./DGE-multiSplit.cwl

  - id: upload-seurat-DGE
    in:
      - id: SEURAT
        source: DGE-multiSplit/seurat_output

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
    run: ./upload-seurat.cwl

  - id: upload-r-objects-DGE
    in:
      - id: R_OBJECTS_CWL
        source: DGE-multiSplit/r_object_output

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
      - id: R_OBJECTS_CWL_dir
    run: ./upload-r-objects.cwl