// Schema for parameter json
// step: the key for the step this parameter belongs to
// parameter: keyword for CWL
// label: human readable form of parameter
// prompt: header of message+input box
// description: content of message+input box
// input: {
//  type: boolean | integer | long | float | double | single | string | file | directory
//        NOTE: we only use... string, float, integer, ranges
//  default: (see above) 
// }
// disabled: boolean for whether we accept these parameters or they're default/blocked

import * as yup from 'yup'

const yupRequiredNaturalNumber = yup.number()
.required()
.positive()
.integer()

const yupRequiredPositiveNumber = yup.number()
.required()
.positive()

const yupRequiredIntegerNumber = yup.number().required().integer()

const TOOLS = {
  SEURAT: [
    {
      label: 'Quality Control',
      step: 'quality',
      parameters: [
        {
          step: 'quality',
          parameter: 'sc_input_type',
          label: 'Single Cell Input Type',
          prompt: 'Select data type of single cell input',
          description: 'Input is in MTX format: barcodes.tsv.gz, features.tsv.gz and matrix.mtx.gz. Default is MTX.',
          input: {
            type: 'select',
            defaultValue: 'MTX',
            options: [
              {key: 'mtx', value: 'MTX', text: 'MTX'},
              {key: 'dge', value: 'DGE', text: 'DGE'},
            ]
          },
          disabled: true
        },
        {
          step: 'quality',
          parameter: 'apply_cell_filters',
          label: 'Apply QC Filters',
          prompt: 'Indicate whether you would like to apply QC filters or skip',
          description: 'Indicates if QC filters (number of genes, number of reads, mitochondrial fraction, ribosomal protein gene fraction) should be applied. Default is "Yes".',
          input: {
            type: 'select',
            defaultValue: 'Y',
            options: [
              {key: 'yes', value: 'Y', text: 'Yes'},
              {key: 'no', value: 'N', text: 'No'},
            ]
          },
          disabled: false
        },
        {
          step: 'quality',
          parameter: 'percent_mito',
          label: 'Mitochondrial Fraction',
          prompt: 'Specify range of mitochondrial fraction',
          description: 'The minimum and maximum fraction (between 0 and 1) of mitochondrial gene counts in a cell to be included in normalization and clustering analyses. For example, for whole cell scRNA-seq use 0 to 0.2, or for nuclei-seq use 0 to 0.05.',
          input: {
            type: 'range',
            step: 0.1,
            defaultValue: {min: 0, max: 0.2},
            schema: yup.object().shape({
              min: yup.number().required().lessThan(yup.ref('max'), 'Minimum must be less than maximum'),
              max: yup.number().required().moreThan(yup.ref('min'), 'Maximum must be more than minimum')
            })
          },
          disabled: false
        },
        // {
        //   step: 'quality',
        //   parameter: 'percent_ribo',
        //   label: 'Ribosomal Protein Genes Fraction',
        //   prompt: 'Specify range of ribosomal protein genes fraction',
        //   description: 'The minimum and maximum fraction (between 0 and 1) of ribosomal protein gene counts in a cell to be included in normalization and clustering analyses.',
        //   input: {
        //     type: 'range',
        //     step: 0.05,
        //     defaultValue: {min: 0, max: 0.75},
        //     schema: yup.object().shape({
        //       min: yup.number().required().lessThan(yup.ref('max'), 'Minimum must be less than maximum'),
        //       max: yup.number().required().moreThan(yup.ref('min'), 'Maximum must be more than minimum')
        //     })
        //   },
        //   disabled: false
        // },
        {
          step: 'quality',
          parameter: 'number_genes',
          label: 'Number of Genes',
          prompt: 'Specify range for number of genes',
          description: 'The minimum and maximum number of unique gene counts in a cell to be included in normalization and clustering analyses. Default is 50 to 8000.',
          input: {
            type: 'range',
            step: 1,
            defaultValue: {min: 50, max: 8000},
            schema: yup.object().shape({
              min: yupRequiredIntegerNumber.lessThan(yup.ref('max'), 'Minimum must be less than maximum'),
              max: yupRequiredIntegerNumber.moreThan(yup.ref('min'), 'Maximum must be more than minimum')
            })
          },
          disabled: false
        },
        // {
        //   step: 'quality',
        //   parameter: 'number_reads',
        //   label: 'Number of Reads',
        //   prompt: 'Specify range for number of reads',
        //   description: 'The minimum and maximum number of unique gene counts in a cell to be included in normalization and clustering analyses. Default is 50 to 8000.',
        //   input: {
        //     type: 'range',
        //     step: 1,
        //     defaultValue: {min: 50, max: 8000},
        //     schema: yup.object().shape({
        //       min: yupRequiredIntegerNumber.lessThan(yup.ref('max'), 'Minimum must be less than maximum'),
        //       max: yupRequiredIntegerNumber.moreThan(yup.ref('min'), 'Maximum must be more than minimum')
        //     })
        //   },
        //   disabled: false
        // }
      ]
    },
    {
      label: 'Normalization',
      step: 'normalization',
      parameters: [
        {
          step: 'normalization',
          parameter: 'normalization_method',
          label: 'Normalization Method',
          prompt: 'Select normalization method',
          description: 'LogNormalize, SCTransform, or Skip Normalization (Input MTX is already normalized). Default is (2) SCTransform.',
          input: {
            type: 'select',
            defaultValue: '2',
            options: [
              {key: 'log_normalize', value: '1', text: 'LogNormalize'},
              {key: 'sc_transform', value: '2', text: 'SCTransform'},
              {key: 'skip_normalization', value: '3', text: 'Skip (input already normalized)'},
            ]
          },
          disabled: false
        }
      ]
    },
    {
      label: 'Dimension Reduction',
      step: 'reduction',
      parameters: [
        {
          step: 'reduction',
          parameter: 'pca_dimensions',
          label: 'PCA Dimensions',
          prompt: 'Number of dimensions for principal component analysis',
          description: 'Max value of PCA dimensions to use for clustering and t-SNE functions. Default is 10.',
          input: {
            type: 'integer',
            defaultValue: 10,
            schema: yupRequiredNaturalNumber
          },
          disabled: false
        }
      ]
    },
    {
      label: 'Cell Clustering',
      step: 'clustering',
      parameters: [
        {
          step: 'clustering',
          parameter: 'resolution',
          label: 'Clustering Resolution',
          prompt: 'Set clustering resolution',
          description: 'Value of the resolution parameter, use a value above 1.0 if you want to obtain a larger number of cell clusters or below 1.0 for a smaller number of cell clusters. Default is 1.0.',
          input: {
            type: 'float',
            step: 0.1,
            defaultValue: 1.0,
            schema: yupRequiredPositiveNumber
          },
          disabled: false
        }
      ]
    },
    {
      label: 'Differential Gene Expression',
      step: 'expression',
      parameters: [
        {
          step: 'expression',
          parameter: 'return_threshold',
          label: 'Return Threshold',
          prompt: 'Set return threshold',
          description: 'For each cluster, only return gene markers that have a p-value less than the specified return threshold. Default is 0.01.',
          input: {
            type: 'float',
            step: 0.01,
            defaultValue: 0.01,
            schema: yupRequiredPositiveNumber
          },
          disabled: false
        }
      ]
    },
  ]
}


export default TOOLS