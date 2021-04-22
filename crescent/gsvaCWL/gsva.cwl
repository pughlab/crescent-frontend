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

  matrix_input:
    type: File
    inputBinding:
      position: 1
      prefix: -i

  matrix_input_type:
    type: string?
    inputBinding:
      position: 2
      prefix: -t

  gene_set:
    type: File
    inputBinding:
      position: 3
      prefix: -c

  project_id:
    type: string?
    default: crescent
    inputBinding:
      position: 4
      prefix: -p

  pvalue_cutoff:
    type: float?
    inputBinding:
      position: 5
      prefix: -e

  fdr_cutoff:
    type: float?
    inputBinding:
      position: 6
      prefix: -f

  runs_cwl:
    type: string?
    default: Y
    inputBinding:
      position: 7
      prefix: -w

  outs_dir:
    type: string?
    default: N
    inputBinding:
      position: 8
      prefix: -o 

outputs:
  gsva_output:
    type: Directory
    outputBinding:
      glob: GSVA
