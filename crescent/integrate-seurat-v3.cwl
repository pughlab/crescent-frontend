cwlVersion: v1.0

class: CommandLineTool

requirements:
  DockerRequirement:
    dockerImageId: /usr/src/app/crescent-v3.simg

baseCommand: [Rscript]

inputs:
  R_script:
    type: File
    inputBinding:
      position: 0

  sc_input:
    type: File
    inputBinding:
      position: 1
      prefix: -i

  reference_datasets:
    type: string?
    inputBinding:
      position: 2
      prefix: -k

  resolution:
    type: float?
    inputBinding:
      position: 3
      prefix: -r

  project_id:
    type: string
    inputBinding:
      position: 4
      prefix: -p

  list_genes:
    type: string?
    inputBinding:
      position: 5
      prefix: -g

  pca_dimensions:
    type: int?
    inputBinding:
      position: 6
      prefix: -d

  return_threshold:
    type: float?
    inputBinding:
      position: 7
      prefix: -e

  expression_comp:
    type: string?
    inputBinding:
      position: 8
      prefix: -f

  number_cores:
    type: string?
    inputBinding:
      position: 9
      prefix: -u

  save_r_object:
    type: string?
    inputBinding:
      position: 10
      prefix: -s

  runs_cwl:
    type: string
    default: Y
    inputBinding:
      position: 11
      prefix: -w

  minio_path:
    type: Directory
    inputBinding:
      position: 12
      prefix: -x

  outs_dir:
    type: string
    default: N
    inputBinding:
      position: 13
      prefix: -o 

outputs:
  seurat_output:
    type: Directory
    outputBinding:
      glob: SEURAT
