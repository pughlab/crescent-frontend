#!/bin/python

import sys
import os
import json
import csv

import helper

def intialize_traces(header):
	""" given a list of the column headers, intialize the list of trace objects """
	result = []
	for col in header:
		if col != 'Barcodes':
			result.append({
				"name": str(col),
				"type": "violin",
				"points": "jitter",
				"jitter": 0.85,
				"meanline": {"visible":"true"},
				"label": [],
				"x": [],
				"y": []
			})

	return result

def get_qc_data(runID):
	""" given a runID get the qc results """
	# check directory existence
	dir_path = "/usr/src/app/results/{runID}/SEURAT/qc".format(runID=runID)
	if not os.path.isdir(dir_path):
		# try command-line path
		dir_path = "../../results/{runID}/SEURAT/qc".format(runID=runID)
		if not os.path.isdir(dir_path):
			helper.return_error("QC results folder not found")

	traces = []
	qc_files = ['BeforeFiltering.tsv','AfterFiltering.tsv']
	for qc_file in qc_files:
		if not os.path.isfile(os.path.join(dir_path,qc_file)):
			helper.return_error(qc_file + " file not found")
		else:
			# parse the file
			with open(os.path.join(dir_path,qc_file)) as tsv_file:
				reader = csv.reader(tsv_file, delimiter="\t")
				header = next(reader)
				traces = intialize_traces(header) if not traces else traces
				for row in reader:
					for trace in traces:
						trace['label'].append(row[header.index('Barcodes')])
						trace['x'].append("Before" if qc_file == 'BeforeFiltering.tsv' else "After")
						trace['y'].append(row[header.index(trace['name'])])

	return traces

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	qc_data = get_qc_data(runID)
	print(json.dumps(qc_data))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
