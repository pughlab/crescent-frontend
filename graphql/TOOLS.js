// TODO: move into database once pipeline builder set up

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
          description: 'Input is in MTX format: barcodes.tsv.gz, features.tsv.gz and matrix.mtx.gz. Default is "MTX".',
          input: {
            type: 'select',
            defaultValue: 'MTX',
            options: [
              {key: 'mtx', value: 'MTX', text: 'MTX'},
              {key: 'dge', value: 'DGE', text: 'DGE'},
            ]
          },
          disabled: true,
          singleDataset: true,
          multiDataset: true,
        },
        {
          step: 'quality',
          parameter: 'apply_cell_filters',
          label: 'Apply QC Filters',
          prompt: 'Indicate whether you would like to apply QC filters or skip',
          description: 'Indicates if QC filters (number of genes, number of UMI counts, mitochondrial fraction, ribosomal protein gene fraction) should be applied. Default is "Yes".',
          input: {
            type: 'select',
            defaultValue: 'Y',
            options: [
              {key: 'yes', value: 'Y', text: 'Yes'},
              {key: 'no', value: 'N', text: 'No'},
            ]
          },
          disabled: false,
          singleDataset: true,
          multiDataset: false,
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
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        },
        {
          step: 'quality',
          parameter: 'percent_ribo',
          label: 'Ribosomal Protein Genes Fraction',
          prompt: 'Specify range of ribosomal protein genes fraction',
          description: 'The minimum and maximum fraction (between 0 and 1) of ribosomal protein gene counts in a cell to be included in normalization and clustering analyses.',
          input: {
            type: 'range',
            step: 0.05,
            defaultValue: {min: 0, max: 0.75},
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        },
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
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        },
        {
          step: 'quality',
          parameter: 'number_reads',
          label: 'Number of UMI Counts',
          prompt: 'Specify range for number of UMI Counts',
          description: 'The minimum and maximum number of unique UMI counts in a cell to be included in normalization and clustering analyses. Default is 50 to 8000.',
          input: {
            type: 'range',
            step: 1000,
            defaultValue: {min: 1, max: 80000},
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        }
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
          description: '"LogNormalize", "SCTransform", or "Skip Normalization" (Input MTX is already normalized). If "Skip Normalization" is used, data should be in log scale, low quality cells should already be removed, and option "No" should be selected in the Quality Control "Apply QC Filters" parameter. Default is "SCTransform". ',
          input: {
            type: 'select',
            defaultValue: '2',
            options: [
              {key: 'log_normalize', value: '1', text: 'LogNormalize'},
              {key: 'sc_transform', value: '2', text: 'SCTransform'},
              {key: 'skip_normalization', value: '3', text: 'Skip Normalization (input already normalized)'},
            ]
          },
          disabled: false,
          singleDataset: true,
          multiDataset: false,
        }
      ]
    },
    {
      label: 'Integration',
      step: 'integration',
      parameters: [
        {
          step: 'integration',
          parameter: 'anchors_function',
          label: 'Integration Anchors Method',
          prompt: 'Select integration anchors method',
          description: '"Seurat" or "STACAS". "Seurat" anchoring uses FindIntegrationAnchors function from the Seurat R library and "STACAS" anchoring uses FindAnchors function from the STACAS R library. Default is "Seurat".',
          input: {
            type: 'select',
            defaultValue: 'Seurat',
            options: [
              {key: 'seurat', value: 'Seurat', text: 'Seurat'},
              {key: 'stacas', value: 'STACAS', text: 'STACAS'},
            ]
          },
          disabled: false,
          singleDataset: false,
          multiDataset: true,
        },
        {
          step: 'integration',
          parameter: 'reference_datasets',
          label: 'Reference Datasets for Anchoring Method',
          prompt: 'Select reference datasets',
          description: 'Select up to 3 datasets to be used as references to obtain anchors (these datasets are expected to cover most expected cell types, with better QC, etc.).',
          input: {
            type: 'multiSelect',
            defaultValue: 'NA',
          },
          disabled: true,
          singleDataset: false,
          multiDataset: true,
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
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
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
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
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
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        },
        {
          step: 'expression',
          parameter: 'dge_comparisons',
          label: 'Differential Gene Expression Comparisons',
          prompt: 'Select differential gene expression comparisons',
          // description: '"LogNormalize", "SCTransform", or "Skip Normalization" (Input MTX is already normalized). If "Skip Normalization" is used, data should be in log scale, low quality cells should already be removed, and option "No" should be selected in the Quality Control "Apply QC Filters" parameter. Default is "SCTransform". ',
          description: "Select one or more options. Options other than the default will significantly increase runtime, depending on number of datasets. Default is 1 = using global cell clusters, compares each cell cluster vs. the rest of cells.",
          input: {
            type: 'multiSelect',
            defaultValue: '1',
            options: [
              // {key: 'no_deg', value: '0', text: '0: no differentially expressed genes are computed'},
              {key: 'global_all', value: '1', text: '1 = using global cell clusters, compares each cell cluster vs. the rest of cells'},
              {key: 'global_dataset_all', value: '2', text: '2 = using global cell clusters, for each dataset, compares each cell cluster vs. the rest of cells'},
              // {key: 'global_dataset_same_cluster', value: '3', text: '3: using global cell clusers, for each dataset, compares each cell cluster vs. the same cluster from other datasets. Needs `-v 1`'},
              // {key: 'global_type_all', value: '4', text: '4 = using global cell clusers, for each dataset type, compares each cell cluster vs. the rest of cells'},
              // {key: 'global_type_same_cluster', value: '5', text: '5: using global cell clusers, for each dataset type, compares each cell cluster vs. the same cluster from other dataset types. Needs `-v 1`'},
              // {key: 'reclustered_dataset_all', value: '6', text: '6: using re-clustered cells, for each dataset, compares each cell cluster vs. the rest of cells. Needs `-v 2`'},
              // {key: 'reclustered_type_all', value: '7', text: '7: using re-clustered cells, for each dataset type, compares each cell cluster vs. the rest of cells. Needs `-v 3`'},
              // {key: 'metadata_all', value: '8', text: '8: using metadata annotations, compares each cell class specified by `-b` and `-c` vs. the rest of cells'},
              // {key: 'metadata_dataset_all', value: '9', text: '9: using metadata annotations, for each dataset, compares each cell class specified by `-b` and `-c` vs. the rest of cells'},
              // {key: 'metadata_dataset_same_cluster', value: '10', text: '10: using metadata annotations, for each dataset, compares each cell class specified by `-b` and `-c` vs. the same class from other datasets'},
              // {key: 'metadata_type_all', value: '11', text: '11: using metadata annotations, for each dataset type, compares each cell class specified by `-b` and `-c` vs. the rest of cells'},
              // {key: 'metadata_type_same_cluster', value: '12', text: '12: using metadata annotations, for each dataset type, compares each cell class specified by `-b` and `-c` vs. the same class from other dataset types'},
            ]
          },
          disabled: false,
          singleDataset: false,
          multiDataset: true,
        }
      ]
    },
    {
      label: 'Save Data',
      step: 'save',
      parameters: [
        {
          step: 'save',
          parameter: 'save_unfiltered_data',
          label: 'Unfiltered MTX Files',
          prompt: 'Save unfiltered raw data (MTX format)',
          description: 'Indicates if unfiltered raw data uploaded as input should be saved in MTX format. Default is "No".',
          input: {
            type: 'select',
            defaultValue: 'N',
            options: [
              {key: 'yes', value: 'Y', text: 'Yes'},
              {key: 'no', value: 'N', text: 'No'},
            ]
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        },
        {
          step: 'save',
          parameter: 'save_filtered_data',
          label: 'Filtered MTX Files',
          prompt: 'Save filtered raw data and normalized data (MTX format)',
          description: 'Indicates if filtered raw data and normalized data from the run should be saved in MTX format. Default is "No".',
          input: {
            type: 'select',
            defaultValue: 'N',
            options: [
              {key: 'yes', value: 'Y', text: 'Yes'},
              {key: 'no', value: 'N', text: 'No'},
            ]
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        },
        {
          step: 'save',
          parameter: 'save_r_object',
          label: 'R Object',
          prompt: 'Save R Object',
          description: 'Indicates if R Object (data and analyses) from the run should be saved as RDS. Default is "No". ',
          input: {
            type: 'select',
            defaultValue: 'N',
            options: [
              {key: 'yes', value: 'Y', text: 'Yes'},
              {key: 'no', value: 'N', text: 'No'},
            ]
          },
          disabled: false,
          singleDataset: true,
          multiDataset: true,
        }
      ]
    },
  ]
}


module.exports = TOOLS