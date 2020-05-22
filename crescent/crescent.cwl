#!/usr/bin/env cwl-runner

cwlVersion: v1.0

class: Workflow

inputs:

  R_script:
    type: File

  sc_input:
    type: Directory

  sc_input_type:
    type: string

  resolution:
    type: float?

  project_id:
    type: string

  summary_plots:
    type: string?

  colour_tsne_discrete:
    type: File?

  list_genes:
    type: string?

  opacity:
    type: float?

  pca_dimensions:
    type: int?

  normalization_method:
    type: string?

  apply_cell_filters:
    type: string

  percent_mito:
    type: string?

  percent_ribo:
    type: string?

  number_genes:
    type: string?

  number_reads:
    type: string?

  return_threshold:
    type: float?

  number_cores:
    type: string?

  runs_cwl:
    type: string?

  outs_dir:
    type: string?

  gsva_R_script:
    type: File

#  matrix_input:
#    type: File

  matrix_input_type:
    type: string?

  gene_set:
    type: File

  gsva_project_id:
    type: string?

  pvalue_cutoff:
    type: float?

  fdr_cutoff:
    type: float?

  gsva_runs_cwl:
    type: string?

  gsva_outs_dir:
    type: string?

steps:
    seurat:
        run: seurat-v3.cwl
        in: 
            R_script: R_script
            sc_input: sc_input
            sc_input_type: sc_input_type
            resolution: resolution
            project_id: project_id
            summary_plots: summary_plots
            colour_tsne_discrete: colour_tsne_discrete
            list_genes: list_genes
            opacity: opacity
            pca_dimensions: pca_dimensions
            normalization_method: normalization_method
            apply_cell_filters: apply_cell_filters
            percent_mito: percent_mito
            percent_ribo: percent_ribo
            number_genes: number_genes
            number_reads: number_reads
            return_threshold: return_threshold
            number_cores: number_cores
            runs_cwl: runs_cwl
            outs_dir: outs_dir
        out: [seurat_output, seurat_avg_exp_output]

    gsva:
        run: gsva.cwl
        in:
            gsva_R_script: gsva_R_script
            matrix_input: seurat/seurat_avg_exp_output
            matrix_input_type: matrix_input_type
            gene_set: gene_set
            gsva_project_id: gsva_project_id
            pvalue_cutoff: pvalue_cutoff
            fdr_cutoff: fdr_cutoff
            gsva_runs_cwl: gsva_runs_cwl
            gsva_outs_dir: gsva_outs_dir
        out: [gsva_output]

outputs:
  seurat_outdir:
    type: Directory
    outputSource: seurat/seurat_output

  gsva_outdir:
    type: Directory
    outputSource: gsva/gsva_output
