cwlVersion: v1.0

class: CommandLineTool

requirements:
  DockerRequirement:
    # dockerPull: crescentdev/crescent-seurat-droplet-gsva-stacas:latest
    dockerPull: crescentdev/crescent-seurat-v4:latest
    
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

  assays_for_dge:
    type: string?
    inputBinding:
      position: 9
      prefix: -t

  number_cores:
    type: string?
    inputBinding:
      position: 10
      prefix: -u

  save_r_object:
    type: string
    default: Y
    inputBinding:
      position: 11
      prefix: -s

  runs_cwl:
    type: int
    default: 1
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
      
  r_object_output:
    type: Directory
    outputBinding:
      glob: R_OBJECTS_CWL
