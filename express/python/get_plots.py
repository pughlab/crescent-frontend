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
	'QC': {"label": "QC", "result": 'qc', "description": 'Quality Control Plots'},
	'HEATMAP': {"label": "Heatmap", "result": "heatmap", "description": "GSVA Enrichment Scores"}
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

	gsva_folder_path = "/usr/src/app/results/{runID}/GSVA/GSVA_RESULTS".format(runID=runID)
	if not os.path.isdir(gsva_folder_path):
		# try command-line path
		gsva_folder_path = "../../results/{runID}/SEURAT/GSVA/GSVA_RESULTS".format(runID=runID)
		if not os.path.isdir(gsva_folder_path):
			pass # this is fine, just means no gsva results available 

	# violin always available
	available_plots['violin']	= DESC['VIOLIN']

	new_groups = []
	if os.path.isfile(os.path.join(gsva_folder_path,"crescent.GSVA_fdr_values.tsv")):
		available_plots['heatmap'] = DESC['HEATMAP']
		# update the groups.tsv to contain the predicted labels if it doesn't already
		# WARNING, THIS IS HACKY AND GROSS
		folder_path = folder_path.replace("frontend_coordinates","frontend_groups")
		if os.path.isfile(os.path.join(folder_path, "groups.tsv")):
			# check if it has the cluster groups
			with open(os.path.join(folder_path, "groups.tsv")) as f:
				groups_reader = csv.reader(f, delimiter="\t")
				first_line = next(groups_reader)
				if "GSVA_Label" not in first_line:
					# add the predicted cell labels to each barcode in groups.tsv
					if os.path.isfile(os.path.join(gsva_folder_path, "crescent.GSVA_final_label.tsv")):
						cluster_labels = {}
						with open(os.path.join(gsva_folder_path, "crescent.GSVA_final_label.tsv"))	as labels:
							reader = csv.reader(labels, delimiter="\t")
							for row in reader:
								cluster_labels[row[0]] = row[1]

					first_line.append("GSVA_Label")
					new_groups.append(first_line)
					second_line = next(groups_reader)
					second_line.append("group")
					new_groups.append(second_line)
					for row in groups_reader:
						if row[1] in cluster_labels:
							cell_label = cluster_labels[row[1]]
							new_row = row + [cell_label]
							new_groups.append(new_row)
						else:
							pass
		
		if new_groups:
			# new groups file made, now ouput file
			with open(os.path.join(folder_path, "groups.tsv"), 'w') as out_file:
				tsv_writer = csv.writer(out_file, delimiter='\t')
				tsv_writer.writerows(new_groups)

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
