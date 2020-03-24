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
	#colours = ['#ffde00', '#fa8a2b', '#e80000'] # any number of hex colours for gradient
	#colours = ['#6d2b82', '#85318a', '#9c3993', '#b2429b', '#c74da4', '#da59ac', '#ec68b4', '#f97abb', '#ff91c1']
	#colours = ['#200092', '#4f009c', '#7006a6', '#8d16b0', '#a726bb', '#c036c7', '#d748d4', '#ed59e3', '#ff6bff']
	#colours = ['#2a0d82', '#491796', '#6623aa', '#8130be', '#9c3fd0', '#b74fe1', '#d161ef', '#e975fa', '#ff8cff']
	#colours = ['#2a0d82', '#4f0e90', '#6e129e', '#8b1aaa', '#a625b5', '#c034be', '#d846c5', '#ed5bc8', '#ff72c7']
	colours = ['#dfdfdf', '#6435c9']
	#colours = ['#2a0d82', '#ff72c7']

	gradient = polylinear_gradient(colours,len(barcode_values)+1)['hex']

	#colourscale = [[barcode_values[i][0], gradient[i]] for i in range(0,len(barcode_values))]

	template_obj = {
		"mode": "markers",
		"text": [],
		"hovertext": [],
		"marker": {
			'color': [], # put sorted markers' colours here from the gradient
			'colorscale':[[0, gradient[0]],[1, gradient[-1]]],
			#'colorscale': colourscale,
			'showscale': True
		},
		"x": [],
		"y": []
	}
	
	if num_cells > 20000:
		# set different rendering to improve speeds
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

def label_with_groups(plotly_obj, barcode_coords, num_cells, group, groups_tsv):
	# the chosen group is in the default groups.tsv file, metadata is irrelevant
	label_idx = groups_tsv[0].index(str(group)) # column index of group
	group_type = groups_tsv[1][label_idx] # datatype
	# construction of plotly object depends on group_type
	if group_type == 'group':
		# colour by discrete label
		for row in groups_tsv[2:]:
			barcode = str(row[0])
			label = str(row[label_idx])
			add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
	elif group_type == 'numeric':
		# colour by gradient, grab all data and sort it
		barcode_values = []
		all_ints = True
		for row in groups_tsv[2:]:
			num_value = float(row[label_idx])
			all_ints = False if not num_value.is_integer() else all_ints
			barcode_values.append((str(row[0]),num_value))
		barcode_values = sorted(barcode_values, key=lambda x: x[1])
		barcode_values = [(x,int(y)) for x, y in barcode_values] if all_ints else [(x,round(y, 2)) for x, y in barcode_values]
		add_barcodes(plotly_obj, group, barcode_values, barcode_coords, num_cells)
	else:
		helper.return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")

	return

def label_with_metadata(plotly_obj, barcode_coords, num_cells, group, groups_tsv, metadata_tsv):
	# the requested group is in the user-defined metadata.tsv
	label_idx = metadata_tsv[0].index(str(group)) # column index of group
	group_type = metadata_tsv[1][label_idx] # datatype
	# master dictionary of all barcodes with x,y coordinates for the selected scatterplot
	all_barcodes = {key: True for key in barcode_coords.keys()}
	if group_type == 'group':
		# colour by discrete label, for any barcode that doesn't have a label, give "NA"
		for row in metadata_tsv[2:]:
			barcode = str(row[0])
			if all_barcodes.pop(barcode, None):
				# exists in all barcodes, ok to add (will be skipped otherwise)
				label = str(row[label_idx])
				add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
		# remaining keys in the dictionary weren't defined in metadata file
		for barcode in all_barcodes.keys():
			label = 'unlabelled'
			add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
	elif group_type == 'numeric':
		# colour by gradient, grab all data and sort it
		barcode_values = []
		all_ints = True # track if all the values can be cast to int
		for row in metadata_tsv[2:]:
			barcode = str(row[0])
			if all_barcodes.pop(barcode, None):
				# store (barcode,value) for every barcode in the master list
				num_value = float(row[label_idx])
				all_ints = False if not num_value.is_integer() else all_ints
				barcode_values.append((barcode,num_value))
		barcode_values = sorted(barcode_values, key=lambda x: x[1])
		# if all values are ints, cast them, otherwise round to 2 decimals
		barcode_values = [(x,int(y)) for x, y in barcode_values] if all_ints else [(x,round(y, 2)) for x, y in barcode_values]
		add_barcodes(plotly_obj, group, barcode_values, barcode_coords, num_cells)
	else:
		helper.return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")

	return

def label_barcodes(barcode_coords, group, runID, projectID):
	""" given the coordinates for the barcodes, sorts them into the specified groups and returns a plotly object """
	plotly_obj = []	
	num_cells = helper.get_cellcount(runID)
	groups_path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID)
	metadata_path = "/usr/src/app/minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional, user-defined
	if not os.path.isfile(groups_path):
		# try command-line path
		groups_path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		metadata_path = "../../minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional
		if not os.path.isfile(groups_path):
			helper.return_error("group label file not found ("+groups_path+")")
	
	# store the file(s) in 2d lists
	groups_tsv = [line.rstrip('\n').split('\t') for line in open(groups_path)]
	metadata_tsv = [line.rstrip('\n').split('\t') for line in open(metadata_path)] if os.path.isfile(metadata_path) else []

	if group in groups_tsv[0]:
		# groups tsv definition supercedes metadata
		label_with_groups(plotly_obj, barcode_coords, num_cells, group, groups_tsv)
	elif group in metadata_tsv[0]:
		# it's defined in the metadata, need to merge with groups_tsv
		label_with_metadata(plotly_obj, barcode_coords, num_cells, group, groups_tsv, metadata_tsv)
	else:
		helper.return_error(group + " is not an available group in groups.tsv or metadata.tsv")

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

def get_plot_data(vis, group, runID, projectID):
	""" given a vistype grouping, runID and projectID, returns the plotly object """
	barcode_coords = get_coordinates(vis, runID)
	plotly_obj = label_barcodes(barcode_coords, group, runID, projectID)
	return plotly_obj

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		vis, group, runID, projectID = params['vis'], params['group'], params['runID'], params['projectID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_plot_data(vis, group, runID, projectID)
	try:
		helper.sort_traces(result)
	except Exception as e:
		pass # this is fine, just means it's not sortable
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
