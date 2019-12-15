#!/bin/python

import sys
import os
import json
import csv

import helper

def get_top_expressed(runID):
	""" given a runID get the top 10 expressed genes + their avg log fold change and p-value """

	# check file existence
	file_path = "/usr/src/app/results/{runID}/SEURAT/markers/TopTenMarkers.tsv".format(runID=runID)
	if not os.path.isfile(file_path):
		# try command-line path
		file_path = "../../results/{runID}/SEURAT/markers/TopTenMarkers.tsv".format(runID=runID)
		if not os.path.isfile(file_path):
			print(file_path)
			helper.return_error("top 10 expressed markers file not found")

	result = []
	# open and parse
	with open(file_path, 'r') as tsv_file:
		reader = csv.reader(tsv_file, delimiter="\t")
		header = next(reader)
		for row in reader:
			feature_result = {}
			for i in range(0, len(header)):
				feature_result[header[i]] = row[i]
			result.append(feature_result)

	return result

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	top_expressed = get_top_expressed(runID)
	print(json.dumps(top_expressed))
	sys.stdout.flush()

if __name__ == "__main__":
    main()