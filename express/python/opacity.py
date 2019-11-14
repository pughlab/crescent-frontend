#!/bin/python

import sys
import os
import json
import csv
import itertools
import loompy

import helper

fileName = "pbmc.loom"

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
	
	path = "/usr/src/app/results/{runID}/groups.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/groups.tsv".format(runID=runID)
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

def calculate_opacities(feature_row):
	""" given the normalized expression row, calculate and return the opacities """
	min_opac = 0.05 # no expression 
	exp_values = [float(x) for x in feature_row]
	max_exp = max(exp_values)
	opacities = [min_opac if val==0.0 else round((val*0.95/max_exp + min_opac), 2) for val in exp_values]	
	return opacities	

def get_opacities(feature, runID):
	""" parses the normalized count matrix to get an expression value for each barcode """
	path = "/usr/src/app/results/{runID}/normalized/{fileName}".format(runID=runID, fileName=fileName) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/normalized/{fileName}".format(runID=runID, fileName=fileName) 
		if not os.path.isfile(path):
			helper.return_error("normalized count matrix not found ("+path+")")

	with loompy.connect(path) as ds:
		barcodes = ds.ca.CellID
		features = ds.ra.Gene
		feature_idx = next((i for i in range(len(features)) if features[i] == feature), -1)
		if feature_idx < 0:
			opacities = calculate_opacities(ds[feature_idx, :])
			return dict(itertools.izip(barcodes, opacities))
		else:
			helper.return_error("Feature Not Found")
	
def get_opacity_data(group, feature, runID):
	""" given a group and feature, returns the expression opacities of the feature of interest for each barcode """
	opacities = get_opacities(feature, runID)
	plotly_obj = sort_barcodes(opacities, group, runID)
	return plotly_obj

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		group, feature, runID = params['group'], params['feature'], params['runID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_opacity_data(group, feature, runID)
	print(result)
	sys.stdout.flush()

if __name__ == "__main__":
    main()
