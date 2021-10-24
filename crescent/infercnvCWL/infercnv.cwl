cwlVersion: v1.0

class: CommandLineTool

requirements:
  DockerRequirement:
    # dockerPull: crescentdev/crescent-seurat-droplet-gsva-stacas:latest
    dockerImageId: crescent-infercnv:latest

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
    type: string?
    default: MTX 
    inputBinding:
      position: 2
      prefix: -t

  cell_type_annotations:
    type: File
    inputBinding:
      position: 3
      prefix: -j

  normal_cell_types:
    type: string
    inputBinding:
      position: 4
      prefix: -k

  gene_coordinates:
    type: File?
    inputBinding:
      position: 5
      prefix: -g  

  project_id:
    type: string?
    default: crescent
    inputBinding:
      position: 6
      prefix: -p

  gene_counts_cutoff:
    type: float?
    inputBinding:
      position: 7
      prefix: -m

  noise_filter:
    type: float?
    inputBinding:
      position: 8
      prefix: -n

  sd_amplifier:
    type: float?
    inputBinding:
      position: 9
      prefix: -s

  runs_cwl:
    type: int
    default: 1
    inputBinding:
      position: 10
      prefix: -w

  outs_dir:
    type: string?
    default: N
    inputBinding:
      position: 11
      prefix: -o 

outputs:
  infercnv_output:
    type: Directory
    outputBinding:
      glob: INFERCNV
