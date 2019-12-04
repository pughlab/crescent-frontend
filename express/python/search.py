#!/bin/python

import sys
import os
import json
import csv
import itertools
import numpy as np

import helper

colours = [
  '#1f77b4',  # muted blue
  '#ff7f0e',  # safety orange
  '#2ca02c',  # cooked asparagus green
  '#d62728',  # brick red
  '#9467bd',  # muted purple
  '#8c564b',  # chestnut brown
  '#e377c2',  # raspberry yogurt pink
  '#7f7f7f',  # middle gray
  '#bcbd22',  # curry yellow-green
  '#17becf'   # blue-teal
]

colour_counter = 0

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

def sort_barcodes(opacities, group, runID):
	""" given the opacities for the barcodes, sorts them into the specified groups and returns a plotly object """
	plotly_obj = []
	
	path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
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
	path = "/usr/src/app/results/{runID}/SEURAT/normalized/normalized_count_matrix.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/normalized/normalized_count_matrix.tsv".format(runID=runID) 
		if not os.path.isfile(path):
			helper.return_error("normalized count matrix not found ("+path+")")	

	with open(path) as norm_counts:
		reader = csv.reader(norm_counts, delimiter="\t")
		barcodes = next(reader)
		for row in reader:
			if str(row[0]) == str(feature):
				feature_exp = [float(x) for x in row[1:]]
				# dict where barcodes are keys, opacities are values
				return dict(itertools.izip(barcodes, feature_exp)) 

	helper.return_error("Feature Not Found")

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

def new_violin_group(label, y_coord):
	""" creates a new violin group for the plot """
	global colour_counter
	violin_group = {
		"name": label,
		"type": "violin",
		"spanmode": "hard",
		"fillcolor": "",
		"line": {"color": colours[colour_counter%len(colours)]},
		"points": "jitter",
		"jitter": 0.85,
		"width": 0.75,
		"meanline": {"visible": "true"},
		"x": [label],
		"y": [y_coord]
	}
	colour_counter += 1
	return violin_group

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

def categorize_barcodes(group, expression_values, runID):
	""" for every group, make a new plotly object and put the barcodes into it """
	path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		if not os.path.isfile(path):
			helper.return_error("group label file not found ("+path+")")	
	plotly_obj = []
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
			add_barcode(plotly_obj, label, barcode, expression_values)

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

def get_violin_data(group, feature, runID):
	""" given a grouping for the cells and a feature of interest, returns the plotly violin object """	
	expression_values = get_expression(feature, runID)
	plotly_obj = categorize_barcodes(group, expression_values, runID)
	calculate_bandwidths(plotly_obj)
	return plotly_obj

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		group, feature, runID = params['group'], params['feature'], params['runID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_violin_data(group, feature, runID)
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
