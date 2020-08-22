cwlVersion: v1.0

class: CommandLineTool

requirements:
  DockerRequirement:
    dockerImageId: /usr/src/app/crescent-seurat-droplet-gsva.simg

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
      prefix: -z

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

  save_filtered_data:
    type: string
    default: N
    inputBinding:
      position: 10
      prefix: -k

  save_r_object:
    type: string
    default: N
    inputBinding:
      position: 11
      prefix: -s

  save_unfiltered_data:
    type: string
    default: N
    inputBinding:
      position: 12
      prefix: -l

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
