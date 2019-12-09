#!/bin/python

import sys
import os
import json
import csv

import helper

def add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells):
	""" add a new barcode to the plotly object and add its label group if it doesn't exist yet """
	for group in plotly_obj:
		if group['name'] == label:
			group['text'].append(barcode)
			group['x'].append(barcode_coords[barcode][0])
			group['y'].append(barcode_coords[barcode][1])
			return

	# group not seen yet
	template_obj = {
		"name": label,
		"mode": "markers",
		"text": [barcode],
		"x": [barcode_coords[barcode][0]],
		"y": [barcode_coords[barcode][1]]
	}
	if num_cells > 20000:
		# add different rendering to improve speeds
		template_obj["type"] = "scattergl"
	
	plotly_obj.append(template_obj)
	
	return

def label_barcodes(barcode_coords, group, runID):
	""" given the coordinates for the barcodes, sorts them into the specified groups and returns a plotly object """
	plotly_obj = []	
	num_cells = helper.get_cellcount(runID)
	path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID)
	
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
			add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)

	return plotly_obj

def get_coordinates(vis, runID):
	""" given a visualization type and runID, gets the coordinates for each barcode and returns in dict """
	barcode_coords = {}
	
	path = "/usr/src/app/results/{runID}/SEURAT/coordinates/{vis}Coordinates.tsv".format(runID=runID, vis=vis.upper())
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/coordinates/{vis}Coordinates.tsv".format(runID=runID, vis=vis.upper())
		if not os.path.isfile(path):
			helper.return_error("specified visualization coordinate file not found")	
	
	with open(path) as coordinate_file:
		reader = csv.reader(coordinate_file, delimiter="\t")
		next(reader) # discard header
		for row in reader:
			barcode = str(row[0])
			if barcode in barcode_coords:
				helper.return_error("duplicate barcode entry in " + str(path))
			else:
				barcode_coords[barcode] = [round(float(row[1]), 3), round(float(row[2]), 3)]

	return barcode_coords

def get_plot_data(vis, group, runID):
	""" given a vistype grouping and runID, returns the plotly object """
	barcode_coords = get_coordinates(vis, runID)
	plotly_obj = label_barcodes(barcode_coords, group, runID)
	return plotly_obj

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		vis, group, runID = params['vis'], params['group'], params['runID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_plot_data(vis, group, runID)
	helper.sort_traces(result)
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
