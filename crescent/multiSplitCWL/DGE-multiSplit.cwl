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
    type: File
    inputBinding:
      position: 1
      prefix: -i

  r_object_input:
    type: File
    inputBinding:
      position: 2
      prefix: -j

  project_id:
    type: string
    inputBinding:
      position: 5
      prefix: -p

  return_threshold:
    type: float?
    inputBinding:
      position: 7
      prefix: -e

  dge_comparisons:
    type: string?
    inputBinding:
      position: 8
      prefix: -f

  number_cores:
    type: string?
    inputBinding:
      position: 9
      prefix: -u

  runs_cwl:
    type: string
    default: Y
    inputBinding:
      position: 13
      prefix: -w

#  minio_path:
#    inputBinding:
#      position: 14
#      prefix: -x
#    type: 
#      type: array
#      items: Directory

  minio_path:  
    type: Directory[]
    inputBinding:
      position: 15
      prefix: -x
      itemSeparator: ","
      
  outs_dir:
    type: string
    default: N
    inputBinding:
      position: 16
      prefix: -o 

outputs:
  seurat_output:
    type: Directory
    outputBinding:
      glob: SEURAT
