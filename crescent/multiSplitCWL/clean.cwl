class: CommandLineTool
cwlVersion: v1.0
requirements:
  InlineJavascriptRequirement: {}
baseCommand: ["rm","-rf"]
inputs:
  - id: SEURAT
    type: string
outputs: []
arguments:
  - position: 1
    valueFrom: $((inputs.SEURAT).split('/').slice(2,8).join('/') + '/') # This will need to be updated for HPC to conform with whatever intermediary path is used there