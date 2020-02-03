#!/bin/python3

import sys
import os
import json
import csv
import itertools
import loompy

import helper

fileName = "normalized_counts.loom"

def add_barcode(plotly_obj, barcode, label, opacities):
	""" add a new barcode to the plotly object and add its label group if it doesn't exist yet """
	for group in plotly_obj:
		if group['name'] == label:
			group['text'].append(barcode)
			group['marker']['opacity'].append(opacities[barcode])
			return
	
	# label not seen yet
	plotly_obj.append({
			"name": label,
			"text": [barcode],
			"marker": {'opacity': [opacities[barcode]]}
	})

	return

def add_barcodes(plotly_obj, barcode_values, group, opacities):
	# continuous scale, add all barcodes
	from gradient import polylinear_gradient
	colours = ['#2a0d82', '#4f0e90', '#6e129e', '#8b1aaa', '#a625b5', '#c034be', '#d846c5', '#ed5bc8', '#ff72c7']
	gradient = polylinear_gradient(colours,len(barcode_values)+1)['hex']
	template_obj = {
		"text": [],
		"hovertext": [],
		"marker": {
			"color": [], # put sorted markers' colours here
			'colorscale': [[0, gradient[0]],[1, gradient[-1]]],
			'opacity': [], # put marker's opacity here
			'showscale': True
		},
	}

	gradient_iter = 0
	for barcode, value in barcode_values:
		template_obj["text"].append(barcode)
		template_obj["hovertext"].append(str(value)+" ("+group+")")
		template_obj["marker"]["color"].append(int(value))
		template_obj["marker"]["opacity"].append(opacities[barcode])
		gradient_iter += 1

	plotly_obj.append(template_obj)
	return

def sort_barcodes(opacities, group, runID, projectID):
	""" given the opacities for the barcodes, sorts them into the specified groups and returns a plotly object """
	plotly_obj = []
	
	groups_path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID)
	metadata_path = "/usr/src/app/minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional, user-defined
	if not os.path.isfile(groups_path):
		# try command-line path
		groups_path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		if not os.path.isfile(groups_path):
			helper.return_error("group label file not found ("+groups_path+")")
			metadata_path = "../../minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional

	# store the file(s) in 2d lists
	groups_tsv = [line.rstrip('\n').split('\t') for line in open(groups_path)]
	metadata_tsv = [line.rstrip('\n').split('\t') for line in open(metadata_path)] if os.path.isfile(metadata_path) else []

	if group in groups_tsv[0]:
		label_idx = groups_tsv[0].index(str(group))
		group_type = groups_tsv[1][label_idx]
		if group_type == 'group':
			for row in groups_tsv[2:]:
				barcode = str(row[0])
				label = str(row[label_idx])
				add_barcode(plotly_obj, barcode, label, opacities)
		elif group_type == 'numeric':
			# colour by gradient
			barcode_values = []
			all_ints = True
			for row in groups_tsv[2:]:
				num_value = float(row[label_idx])
				all_ints = False if not num_value.is_integer() else all_ints
				barcode_values.append((str(row[0]),num_value))
			barcode_values = sorted(barcode_values, key=lambda x: x[1])
			barcode_values = [(x,int(y)) for x, y in barcode_values] if all_ints else [(x,round(y, 2)) for x, y in barcode_values]
			add_barcodes(plotly_obj, barcode_values, group, opacities)
		else:
			helper.return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")
	elif group in metadata_tsv[0]:
		# use the metadata
		label_idx = metadata_tsv[0].index(str(group))
		group_type = metadata_tsv[1][label_idx]
		if group_type == 'group':
			for row in metadata_tsv[2:]:
				barcode = str(row[0])
				label = str(row[label_idx])
				add_barcode(plotly_obj, barcode, label, opacities)
		elif group_type == 'numeric':
			# colour by gradient
			barcode_values = []
			all_ints = True
			for row in metadata_tsv[2:]:
				num_value = float(row[label_idx])
				all_ints = False if not num_value.is_integer() else all_ints
				barcode_values.append((str(row[0]),num_value))
			barcode_values = sorted(barcode_values, key=lambda x: x[1])
			barcode_values = [(x,int(y)) for x, y in barcode_values] if all_ints else [(x,round(y, 2)) for x, y in barcode_values]
			add_barcodes(plotly_obj, barcode_values, group, opacities)
		else:
			helper.return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")


		pass
	else:
		helper.return_error(group + " is not an available group in groups.tsv or metadata.tsv")

	"""
	
	with open(path) as group_definitions:
		reader = csv.reader(group_definitions, delimiter="\t")
		available_groups = next(reader)[1:]
		try:
			label_idx = available_groups.index(str(group)) + 1
		except ValueError as e:
			helper.return_error(group + " is not an available group")		
		for row in reader:
			barcode = str(row[0])
			label = str(row[label_idx])
			add_barcode(plotly_obj, barcode, label, opacities)
	"""

	return plotly_obj

def calculate_opacities(feature_row):
	""" given the normalized expression row, calculate and return the opacities """
	min_opac = 0.05 # no expression 
	exp_values = [float(x) for x in feature_row]
	max_exp = max(exp_values)
	opacities = [min_opac if val==0.0 else round((val*0.95/max_exp + min_opac), 2) for val in exp_values]	
	return opacities	

def get_opacities(feature, runID):
	""" parses the normalized count matrix to get an expression value for each barcode """
	path = "/usr/src/app/results/{runID}/SEURAT/normalized/{fileName}".format(runID=runID, fileName=fileName) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/normalized/{fileName}".format(runID=runID, fileName=fileName) 
		if not os.path.isfile(path):
			helper.return_error("normalized count matrix not found ("+path+")")

	with loompy.connect(path) as ds:
		barcodes = ds.ca.CellID
		features = ds.ra.Gene
		feature_idx = next((i for i in range(len(features)) if features[i] == feature), -1)
		if feature_idx >= 0:
			opacities = calculate_opacities(ds[feature_idx, :])
			return dict(zip(barcodes, opacities))
		else:
			helper.return_error("Feature Not Found")
	
def get_opacity_data(group, feature, runID, projectID):
	""" given a group and feature, returns the expression opacities of the feature of interest for each barcode """
	opacities = get_opacities(feature, runID)
	plotly_obj = sort_barcodes(opacities, group, runID, projectID)
	return plotly_obj

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		group, feature, runID, projectID = params['group'], params['feature'], params['runID'], params['projectID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_opacity_data(group, feature, runID, projectID)
	try:
		helper.sort_traces(result)
	except Exception as e:
		pass # not sortable, (o.k.)
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()