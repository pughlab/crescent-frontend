#!/bin/python

import sys
import os
import json
import csv

import helper

DESC = {
	'TSNE': {"label": 't-SNE', "result": 'tsne', "description": 't-Distributed Stochastic Neighbour Embedding'},
	'UMAP': {"label": 'UMAP', "result": 'umap', "description": 'Uniform Manifold Approximation and Projection for Dimension Reduction'},
	'VIOLIN': {"label": 'Gene Expression Violin', "result": 'violin', "description": 'Violin Plots'},
	'QC': {"label": "QC", "result": 'qc', "description": 'Quality Control Plots'}
}

def has_qc(runID):
	""" check for the existence of qc data """
	folder_path = "/usr/src/app/results/{runID}/SEURAT/frontend_qc".format(runID=runID)
	if not os.path.isdir(folder_path):
		# try command-line path
		folder_path = "../../results/{runID}/SEURAT/frontend_qc".format(runID=runID)
		if not os.path.isdir(folder_path):
			return False
	return True

def find_plot_files(runID):
	""" given a runID get the available plots """
	available_plots = {}

	# add qc plots to list if available
	if has_qc(runID):
		available_plots['qc'] = DESC['QC']
	
	# check if the scatterplot coordinates are available
	folder_path = "/usr/src/app/results/{runID}/SEURAT/frontend_coordinates".format(runID=runID)
	if not os.path.isdir(folder_path):
		# try command-line path
		folder_path = "../../results/{runID}/SEURAT/frontend_coordinates".format(runID=runID)	
		if not os.path.isdir(folder_path):
			helper.return_error("coordinates folder not found ("+folder_path+")")	
	for filename in os.listdir(folder_path):
		if filename.endswith("Coordinates.tsv"):
			plot_name = filename.split("Coordinates")[0].upper()
			if plot_name in DESC:
				available_plots[plot_name.lower()] = DESC[plot_name]

	# violin always available
	available_plots['violin']	= DESC['VIOLIN']
	
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

	available_plots = find_plot_files(runID)
	print(json.dumps({"plots": available_plots}))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
