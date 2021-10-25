class: Workflow
cwlVersion: v1.0

inputs:

  - id: project_id
    type: string

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


  - id: sc_input_type
    type: string?

  - id: normal_cell_types
    type: string  

  - id: gene_counts_cutoff
    type: float?

  - id: noise_filter
    type: float?

  - id: sd_amplifier
    type: float?
    
outputs: []
steps:
  - id: extract-infercnv
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
      - id: R_file_INFERCNV
      - id: cell_type_annotations_input
      # - id: normal_cell_types_input
      - id: gene_coordinates_input
      - id: runs_dir

    run: ./extract-infercnv.cwl

  - id: infercnv
    in:
      - id: runs_dir
        source: extract-infercnv/runs_dir
      
      - id: R_script
        source: extract-infercnv/R_file_INFERCNV

      - id: sc_input
        source: extract-infercnv/input_dir   

      - id: sc_input_type
        source: sc_input_type

      - id: project_id
        source: project_id

      - id: cell_type_annotations
        source: extract-infercnv/cell_type_annotations_input

      - id: normal_cell_types
        source: normal_cell_types   

      - id: gene_coordinates
        source: extract-infercnv/gene_coordinates_input    

      - id: gene_counts_cutoff
        source: gene_counts_cutoff

      - id: noise_filter
        source: noise_filter

      - id: sd_amplifier
        source: sd_amplifier

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

    out:
      - id: infercnv_output
    run: ./infercnv.cwl

  - id: upload-infercnv
    in:
      - id: INFERCNV
        source: infercnv/infercnv_output

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
      - id: INFERCNV_dir
    run: ./upload-infercnv.cwl