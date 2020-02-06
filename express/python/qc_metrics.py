#!/bin/python

import sys
import os
import json

import helper

def get_qc_metrics(runID):
	""" given a runID, return the cells before and after filtering """

	metrics = {}
	dir_path = "/usr/src/app/results/{runID}/SEURAT/qc".format(runID=runID)
	if not os.path.isdir(dir_path):
		dir_path = "/usr/src/app/results/{runID}/SEURAT/qc".format(runID=runID)
		if not os.path.isdir(dir_path):
			return_error("QC results folder not found")

	qc_files = ['BeforeFiltering.tsv','AfterFiltering.tsv']
	for qc_file in qc_files:
		filepath = os.path.join(dir_path,qc_file)
		if os.path.isfile(filepath):
			with open(filepath) as f:
				for i, l in enumerate(f):
					pass
			metrics[qc_file.split('Filtering.tsv',1)[0]] = str(i)
		else:
			helper.return_error(qc_file + " file not found")

	return metrics

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	metrics = get_qc_metrics(runID)
	print(json.dumps({"qc_metrics": metrics}))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
