#!/bin/python

import sys
import os
import json
import csv

import helper

dropdown_plots = {
	"filtered": {
		"key": 'filtered',
		"text": 'Before and After Filtering',
		"value": 'filtered'
	},
	"Number_of_Genes": {
		"key": 'Number_of_Genes',
		"text": 'Number of Genes',
		"value": 'Number_of_Genes'
	},
	"Number_of_Reads": {
		"key": 'Number_of_Reads',
		"text": 'Number of Reads',
		"value": 'Number_of_Reads'
	},
	"Mitochondrial_Genes_Fraction": {
		"key": 'Mitochondrial_Genes_Fraction',
		"text": 'Fraction of Mitochondrial Genes',
		"value": 'Mitochondrial_Genes_Fraction'
	},
	"Ribosomal_Protein_Genes_Fraction": {
		"key": 'Ribosomal_Protein_Genes_Fraction',
		"text": 'Fraction of Ribosomal Genes',
		"value": 'Ribosomal_Protein_Genes_Fraction'
	}
}

def get_available_qc_data(runID):
	# check directory existence
	dir_path = "/usr/src/app/results/{runID}/SEURAT/qc".format(runID=runID)
	if not os.path.isdir(dir_path):
		# try command-line path
		dir_path = "../../results/{runID}/SEURAT/qc".format(runID=runID)
		if not os.path.isdir(dir_path):
			helper.return_error("QC results folder not found: "+str(dir_path))

	available_plots = []
	# if both before and after tsv files exist, can show filtering
	if os.path.exists(os.path.join(dir_path, 'AfterFiltering.tsv')) and os.path.exists(os.path.join(dir_path, 'BeforeFiltering.tsv')):
		available_plots.append(dropdown_plots['filtered'])

	qc_file = os.path.join(dir_path, 'qc_data.tsv')
	if os.path.exists(qc_file):
		qc_data = open(qc_file, 'r')
		header = qc_data.readline().split("\t")
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
