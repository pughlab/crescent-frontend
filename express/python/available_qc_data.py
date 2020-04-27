#!/bin/python

import sys
import os
import json
import csv

import helper

dropdown_plots = {
	"Before_After_Filtering": {
		"key": 'Before_After_Filtering',
		"text": 'Metrics Before and After QC (Violins)',
		"value": 'Before_After_Filtering'
	},
	"Number_of_Genes": {
		"key": 'Number_of_Genes',
		"text": 'Number of Genes (UMAP)',
		"value": 'Number_of_Genes'
	},
	"Number_of_Reads": {
		"key": 'Number_of_Reads',
		"text": 'Number of Reads (UMAP)',
		"value": 'Number_of_Reads'
	},
	"Mitochondrial_Genes_Percentage": {
		"key": 'Mitochondrial_Genes_Percentage',
		"text": 'Mitochondrial Genes Percentage (UMAP)',
		"value": 'Mitochondrial_Genes_Percentage'
	},
	"Ribosomal_Protein_Genes_Percentage": {
		"key": 'Ribosomal_Protein_Genes_Percentage',
		"text": 'Ribosomal Protein Genes Percentage (UMAP)',
		"value": 'Ribosomal_Protein_Genes_Percentage'
	}
}

def get_available_qc_data(runID):
	# check directory existence
	dir_path = "/usr/src/app/results/{runID}/SEURAT/frontend_qc".format(runID=runID)
	if not os.path.isdir(dir_path):
		# try command-line path
		dir_path = "../../results/{runID}/SEURAT/frontend_qc".format(runID=runID)
		if not os.path.isdir(dir_path):
			helper.return_error("QC results folder not found: "+str(dir_path))

	available_plots = []
	# if both before and after tsv files exist, can show filtering
	if os.path.exists(os.path.join(dir_path, 'AfterFiltering.tsv')) and os.path.exists(os.path.join(dir_path, 'BeforeFiltering.tsv')):
		available_plots.append(dropdown_plots['Before_After_Filtering'])

	qc_file = os.path.join(dir_path, 'qc_data.tsv')
	if os.path.exists(qc_file):
		qc_data = open(qc_file, 'r')
		header = [x.strip() for x in qc_data.readline().split("\t")]
		for col in header:
			if col in dropdown_plots:
				available_plots.append(dropdown_plots[col])

	return available_plots

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	qc_data = get_available_qc_data(runID)
	print(json.dumps(qc_data))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
