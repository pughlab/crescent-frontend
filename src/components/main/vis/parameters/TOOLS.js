// Schema for parameter json
// step: the key for the step this parameter belongs to
// parameter: keyword for CWL
// label: human readable form of parameter
// prompt: header of message+input box
// description: content of message+input box
// input: {
//  type: boolean | integer | long | float | double | single | string | file | directory
//        NOTE: we only use... string, float, integer, (and technically ranges)
//  default: (see above) 
// }
// disabled: boolean for whether we accept these parameters or they're default/blocked
const parameterExample = {
  step: 'quality',
  parameter: 'sc_input_type',
  label: 'Single Cell Input Type',
  prompt: 'Select data type of single cell input',
  description: 'Input can be either MTX: barcodes.tsv.gz, features.tsv.gz and matrix.mtx.gz files or DGE: tab delimited digital gene expression (DGE) file with genes in rows vs. barcodes in columns. Default is MTX.',
  input: {
    type: 'string',
    default: 'MTX'
  },
  disabled: false
}

const TOOLS = {
  SEURAT: {
    STEPS = [
      {
        label: 'Quality Control',
        step: 'quality',
        parameters: [
          {
            step: 'quality',
            parameter: 'sc_input_type',
            label: 'Single Cell Input Type',
            prompt: 'Select data type of single cell input',
            description: 'Input can be either MTX: barcodes.tsv.gz, features.tsv.gz and matrix.mtx.gz files or DGE: tab delimited digital gene expression (DGE) file with genes in rows vs. barcodes in columns. Default is MTX.',
            input: {
              type: 'string',
              default: 'MTX'
            },
            disabled: false
          }
        ]
      },
      {label: 'Normalization', step: 'normalization'},
      {label: 'Dimension Reduction', step: 'reduction'},
      {label: 'Cell Clustering', step: 'clustering'},
      {label: 'Differential Expression', step: 'expression'},
    ]
  }
}

