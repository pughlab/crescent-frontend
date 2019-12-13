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
const example = {
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

// step: the key for the step this parameter belongs to
// parameter: keyword for CWL
// label: menu label when selecting parameter values
// prompt: header of message
// description: content of message
const parameter = (step, parameter, label, prompt, description) => ({
  step, parameter, label, prompt, description
})

const PARAMETERS = [
  parameter(
    'quality',
    'sc_input_type',
    'Single Cell Input Type',
    'Select type of single cell input',
    'Input can be either MTX: barcodes.tsv.gz, features.tsv.gz and matrix.mtx.gz files or DGE: tab delimited digital gene expression (DGE) file with genes in rows vs. barcodes in columns. Default is MTX.'
  ),
  parameter(
    'quality',
    'number_genes',
    'Number of Genes',
    'Specify range for number of genes',
    'The minimum and maximum number of unique gene counts in a cell to be included in normalization and clustering analyses. Default is 50 to 8000.'
  ),
  parameter(
    'quality',
    'percent_mito',
    'Mitochondrial Fraction',
    'Specify range of mitochondrial fraction',
    'The minimum and maximum fraction of mitochondrial gene counts in a cell to be included in normalization and clustering analyses. For example, for whole cell scRNA-seq use 0 to 0.2, or for Nuc-seq use 0 to 0.05.'
  ),
  parameter(
    'clustering',
    'resolution',
    'Clustering Resolution',
    'Set clustering resolution',
    'Value of the resolution parameter, use a value above 1.0 if you want to obtain a larger number of cell clusters or below 1.0 for a smaller number of cell clusters. Default is 1.0.'
  ),
  parameter(
    'reduction',
    'pca_dimensions',
    'PCA Dimensions',
    'Number of dimensions for principal component analysis',
    'Max value of PCA dimensions to use for clustering and t-SNE functions. Default is 10.'
  )
]

export default PARAMETERS