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
    valueFrom: $((inputs.SEURAT).split('/').slice(2,8).join('/') + '/') 
# The index 2 is used for parsing, index 8 is used to get the tmpdir. 
# Change 8 -> 7 to have the workflow commit suicide, cleaning everything including toil logs