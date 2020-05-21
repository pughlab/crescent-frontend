#!/bin/python

import sys
import os
import json
import csv

import helper


def get_heatmap_data(runID):
	""" given a runID, fetch the heatmap data """
	heatmap_data = {}
	path = "/usr/src/app/results/{runID}/SEURAT/frontend_coordinates/HEATMAPCoordinates.tsv".format(runID=runID)
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/frontend_coordinates/HEATMAPCoordinates.tsv".format(runID=runID)
		if not os.path.isfile(path):
			helper.return_error("Heatmap coordinate file not found")	
	
	with open(path) as heatmap_file:
		reader = csv.reader(heatmap_file, delimiter="\t")
		cell_types = next(reader)[1:] # cell types are first line
		heatmap_data['x'] = cell_types
		heatmap_data['y'] = []
		heatmap_data['text'] = []
		heatmap_data['hoverinfo'] = 'x+y+z'

		heatmap_data['z'] = [] # this will contain the gsva values
		for row in reader:
			cluster = row[0]
			heatmap_data['y'].append(cluster)
			heatmap_data['z'].append(row[1:])
			heatmap_data['text'].append(row[1:])

	heatmap_data['type'] = 'heatmap'
	return heatmap_data

def main():
	try:
		params = json.loads(sys.argv[1]) # parse json inputs
		runID = params['runID']
	except Exception as e:
		helper.return_error("unable to read arguments: "+str(e))

	result = get_heatmap_data(runID)
	
	print(json.dumps(result))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
