class: CommandLineTool
cwlVersion: v1.0
requirements:
  InlineJavascriptRequirement: {}
baseCommand: ["rm","-rf"]
inputs:
  - id: SEURAT2
    type: string
outputs: []
arguments:
  - position: 1
    valueFrom: $((inputs.SEURAT2).split('/').slice(2,8).join('/') + '/')