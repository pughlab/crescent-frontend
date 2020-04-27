#!/bin/python

import sys
import os
import json
import csv
import itertools
import loompy
import numpy as np

import helper

fileName = "normalized_counts.loom"

colour_counter = 0

def add_barcode(plotly_obj, label, barcode, expression_values):
	""" add the barcode+expression to an exisiting group or make a new one in the plotly object """
	for group in plotly_obj:
		if group['name'] == label:
			group['x'].append(label)
			group['y'].append(expression_values[barcode])
			return

	# label not seen yet, create new group
	plotly_obj.append(new_violin_group(label, expression_values[barcode]))
	return

def label_with_groups(plotly_obj, expression_values, group, labels_tsv):
	# label each barcode with its chosen group
	label_idx = labels_tsv[0].index(str(group))
	group_type = labels_tsv[1][label_idx]
	all_barcodes = {key: True for key in expression_values.keys()}
	if group_type == 'group':
		for row in labels_tsv[2:]:
			barcode = str(row[0])
			if all_barcodes.pop(barcode, None):
				# only add barcodes that exist in expressions dictionary
				label = str(row[label_idx])
				add_barcode(plotly_obj, label, barcode, expression_values)
		# now add the remaining barcodes without a label
		for barcode in all_barcodes.keys():
			label = 'unlabeled'
			add_barcode(plotly_obj, label, barcode, expression_values)
	elif group_type == 'numeric':
		# can't do this for violins
		helper.return_error(group + " is numeric data, not viewable in violin plots")
	else:
		helper.return_error(group + " does not have a valid data type (must be 'group')")

	return plotly_obj

def sort_barcodes(opacities, group, runID):
	""" given the opacities for the barcodes, sorts them into the specified groups and returns a plotly object """
	plotly_obj = []
	
	path = "/usr/src/app/results/{runID}/SEURAT/frontend_groups/groups.tsv".format(runID=runID)
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/frontend_groups/groups.tsv".format(runID=runID)
		if not os.path.isfile(path):
			helper.return_error("group label file not found ("+path+")")
	
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

	return plotly_obj

def get_expression(feature, runID):
	""" parses the normalized count matrix to get an expression value for each barcode """
	path = "/usr/src/app/results/{runID}/SEURAT/frontend_normalized/{fileName}".format(runID=runID, fileName=fileName)
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/frontend_normalized/{fileName}".format(runID=runID, fileName=fileName)
		if not os.path.isfile(path):
			helper.return_error("normalized count matrix not found ("+path+")")

	with loompy.connect(path) as ds:
		barcodes = ds.ca.CellID
		features = ds.ra.Gene
		feature_idx = next((i for i in range(len(features)) if features[i] == feature), -1)
		if feature_idx >= 0:
			feature_exp = [float(i) for i in ds[feature_idx, :]]
			return dict(zip(barcodes, feature_exp))
		else:
			helper.return_error("Feature Not Found")

	with open(path) as norm_counts:
		reader = csv.reader(norm_counts, delimiter="\t")
		barcodes = next(reader)
		for row in reader:
			if str(row[0]) == str(feature):
				feature_exp = [float(x) for x in row[1:]]
				# dict where barcodes are keys, opacities are values
				return dict(zip(barcodes, feature_exp)) 

	helper.return_error("Feature Not Found")



def new_violin_group(label, y_coord):
	""" creates a new violin group for the plot """
	global colour_counter
	violin_group = {
		"name": label,
		"type": "violin",
		"spanmode": "hard",
		"fillcolor": "",
		"line": {"color": helper.COLOURS[colour_counter%len(helper.COLOURS)] },
		"points": "jitter",
		"jitter": 0.85,
		"width": 0.75,
		"meanline": {"visible": "true"},
		"x": [label],
		"y": [y_coord]
	}
	colour_counter += 1
	return violin_group

def categorize_barcodes(group, expression_values, runID, projectID):
	""" for every group, make a new plotly object and put the barcodes into it """
	groups_path = "/usr/src/app/results/{runID}/SEURAT/frontend_groups/groups.tsv".format(runID=runID)
	metadata_path = "/usr/src/app/minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional, user-defined
	if not os.path.isfile(groups_path):
		# try command-line path
		groups_path = "../../results/{runID}/SEURAT/frontend_groups/groups.tsv".format(runID=runID)
		metadata_path = "../../minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional
		if not os.path.isfile(groups_path):
			helper.return_error("group label file not found ("+groups_path+")")

	# store the file(s) in 2d lists
	groups_tsv = [line.rstrip('\n').split('\t') for line in open(groups_path)]
	metadata_tsv = [line.rstrip('\n').split('\t') for line in open(metadata_path)] if os.path.isfile(metadata_path) else []

	plotly_obj = []
	if group in groups_tsv[0]:
		# groups tsv definition supercedes metadata
		label_with_groups(plotly_obj, expression_values, group, groups_tsv)
	elif group in metadata_tsv[0]:
		# it's defined in the metadata
		label_with_groups(plotly_obj, expression_values, group, metadata_tsv)
	else:
		helper.return_error(group + " is not an available group in groups.tsv or metadata.tsv")

	return plotly_obj


def calculate_bandwidths(plotly_obj):
	""" all expression values now recorded, calculate bandwidths and display violins with null bandwidths as boxplots """
	for violin_group in plotly_obj:
		y_values = violin_group['y']
		#print(y_values.count(0.0)/float(len(y_values))*100)
		if sum(y_values) == 0.0:
			violin_group['type'] = 'box'
		else:
			# replace 0s with 0.1 for kernel density estimate (doesn't perform well on sparse data) 
			mod_values = [0.1 if val == 0.0 else val for val in y_values]
			# calculate Silverman's Rule of Thumb	for bandwidth
			iqr = np.subtract(*np.percentile(mod_values, [75,25]))
			std = np.std(mod_values)
			violin_group['bandwidth'] = 0.9 * min(std, iqr/1.34) * (len(mod_values)**(-1/5.0))

	return

def get_violin_data(group, feature, runID, projectID):
	""" given a grouping for the cells and a feature of interest, returns the plotly violin object """	
	expression_values = get_expression(feature, runID)
	plotly_obj = categorize_barcodes(group, expression_values, runID, projectID)
	calculate_bandwidths(plotly_obj)
	return plotly_obj

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		group, feature, runID, projectID = params['group'], params['feature'], params['runID'], params['projectID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_violin_data(group, feature, runID, projectID)
	helper.sort_traces(result)
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
