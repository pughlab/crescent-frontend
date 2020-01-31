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

def add_barcodes(plotly_obj, column_name, barcode_values, barcode_coords, num_cells):
	""" add all barcodes to the plotly object with their corresponding colour gradient based on value """

	from gradient import polylinear_gradient	
	#colours = ['#ffde00', '#ff9b37', '#ff3f1f']
	colours = ['#ffde00', '#fa8a2b', '#e80000'] # any number of hex colours for gradient
	gradient = polylinear_gradient(colours,len(barcode_values)+1)['hex']

	template_obj = {
		"mode": "markers",
		"text": [],
		"hovertext": [],
		"marker": {
			'color': [], # put sorted markers' colours here from the gradient
			'colorscale':[[0, colours[0]],[1, colours[-1]]],
			'showscale': True
		},
		"x": [],
		"y": []
	}
	
	if num_cells > 20000:
		# add different rendering to improve speeds
		template_obj["type"] = "scattergl"

	gradient_iter = 0
	for barcode, value in barcode_values:
		template_obj["text"].append(barcode)
		template_obj["hovertext"].append(str(value)+" ("+column_name+")")
		template_obj["x"].append(barcode_coords[barcode][0])
		template_obj["y"].append(barcode_coords[barcode][1])
		template_obj["marker"]["color"].append(int(value))
		gradient_iter += 1

	plotly_obj.append(template_obj)
	return

def label_barcodes(barcode_coords, group, runID):
	""" given the coordinates for the barcodes, sorts them into the specified groups and returns a plotly object """
	plotly_obj = []	
	num_cells = helper.get_cellcount(runID)
	path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID)
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		if not os.path.isfile(path):
			helper.return_error("group label file not found ("+path+")")
	
	with open(path) as group_definitions:
		reader = csv.reader(group_definitions, delimiter="\t")
		available_groups = next(reader)[1:]
		group_types = next(reader)[1:]
		try:
			label_idx = available_groups.index(str(group))
			group_type = group_types[label_idx]
			label_idx += 1
		except ValueError as e:
			helper.return_error(group + " is not an available group")

		# construction of plotly object depends on group_type
		if group_type == 'group':
			# colour by discrete label
			for row in reader:
				barcode = str(row[0])
				label = str(row[label_idx])
				add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
		elif group_type == 'numeric':
			# colour by gradient, need to grab all data by label and sort it
			barcode_values = []
			all_ints = True
			for row in reader:
				num_value = float(row[label_idx])
				all_ints = False if not num_value.is_integer() else all_ints
				barcode_values.append((str(row[0]),num_value))					

			barcode_values = sorted(barcode_values, key=lambda x: x[1])
			if all_ints:
				barcode_values = [(x,int(y)) for x, y in barcode_values]
			else:
				barcode_values = [(x,round(y, 2)) for x, y in barcode_values]
			add_barcodes(plotly_obj, group, barcode_values, barcode_coords, num_cells)
		else:
			helper.return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")

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
	try:
		helper.sort_traces(result)
	except Exception as e:
		pass # this is fine, just means it's not sortable
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
