cwlVersion: v1.0

class: CommandLineTool

requirements:
  DockerRequirement:
    dockerPull: crescentdev/crescent-seurat-droplet-gsva-stacas:latest

baseCommand: [Rscript]

inputs:
  runs_dir:
    type: Directory

  R_script:
    type: File
    inputBinding:
      position: 0

  sc_input:
    type: Directory[]
    inputBinding:
      position: 1
      prefix: -i

  sc_input_type:
    type: string
    inputBinding:
      position: 2
      prefix: -t

  resolution:
    type: float?
    inputBinding:
      position: 3
      prefix: -r

  project_id:
    type: string
    inputBinding:
      position: 5
      prefix: -p

  colour_tsne_discrete:
    type: File?
    inputBinding:
      position: 7
      prefix: -c

  list_genes:
    type: string?
    inputBinding:
      position: 8
      prefix: -g

  pca_dimensions:
    type: int?
    inputBinding:
      position: 10
      prefix: -d

  normalization_method:
    type: string?
    inputBinding:
      position: 11
      prefix: -b

  apply_cell_filters:
    type: string
    default: Y
    inputBinding:
      position: 12
      prefix: -f

  percent_mito:
    type: string?
    inputBinding:
      position: 13
      prefix: -m

  percent_ribo:
    type: string?
    inputBinding:
      position: 14
      prefix: -q

  number_genes:
    type: string?
    inputBinding:
      position: 15
      prefix: -n

  number_reads:
    type: string?
    inputBinding:
      position: 16
      prefix: -v

  return_threshold:
    type: float?
    inputBinding:
      position: 17
      prefix: -e

  number_cores:
    type: string?
    inputBinding:
      position: 18
      prefix: -u

  runs_cwl:
    type: string
    default: Y
    inputBinding:
      position: 19
      prefix: -w

  outs_dir:
    type: string
    default: N
    inputBinding:
      position: 20
      prefix: -o 

  save_filtered_data:
    type: string
    default: N
    inputBinding:
      position: 21
      prefix: -k

  save_r_object:
    type: string
    default: N
    inputBinding:
      position: 22
      prefix: -s

  save_unfiltered_data:
    type: string
    default: N
    inputBinding:
      position: 23
      prefix: -l

outputs:
  seurat_output:
    type: Directory
    outputBinding:
      glob: ["SEURAT/"]