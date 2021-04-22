class: Workflow
cwlVersion: v1.0

inputs:

  - id: project_id
    type: string

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


  - id: matrix_input_type
    type: string?

  - id: pvalue_cutoff
    type: float?

  - id: fdr_cutoff
    type: float?
    
outputs: []
steps:
  - id: extract-gsva
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
      - id: geneset
      - id: R_file_GSVA
      - id: avg_gene_exp_output
      - id: runs_dir

    run: ./extract-gsva.cwl

  - id: gsva
    in:
      - id: runs_dir
        source: extract-gsva/runs_dir
      
      - id: R_script
        source: extract-gsva/R_file_GSVA

      - id: matrix_input
        source: extract-gsva/avg_gene_exp_output   

      - id: matrix_input_type
        source: matrix_input_type

      - id: project_id
        source: project_id

      - id: gene_set
        source: extract-gsva/geneset

      - id: pvalue_cutoff
        source: pvalue_cutoff

      - id: fdr_cutoff
        source: fdr_cutoff

      - id: runs_cwl
        source: runs_cwl

      - id: outs_dir
        source: outs_dir

    out:
      - id: gsva_output
    run: ./gsva.cwl

  - id: upload-gsva
    in:
      - id: GSVA
        source: gsva/gsva_output

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
      - id: GSVA_dir
    run: ./upload-gsva.cwl