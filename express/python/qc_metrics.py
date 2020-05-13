#!/bin/python

import sys
import os
import json
import csv

import helper

def get_qc_metrics(runID):
	""" given a runID, return the cells before and after filtering as well as data about the qc steps"""

	metrics = [{"cellcounts": {}}]
	dir_path = "/usr/src/app/results/{runID}/SEURAT/frontend_qc".format(runID=runID)
	if not os.path.isdir(dir_path):
		dir_path = "/usr/src/app/results/{runID}/SEURAT/frontend_qc".format(runID=runID)
		if not os.path.isdir(dir_path):
			helper.return_error("QC results folder not found")

	qc_files = ['BeforeFiltering.tsv','AfterFiltering.tsv']
	for qc_file in qc_files:
		filepath = os.path.join(dir_path,qc_file)
		if os.path.isfile(filepath):
			with open(filepath) as f:
				for i, l in enumerate(f):
					pass
			name = qc_file.split('Filtering.tsv',1)[0] 
			metrics[0]["cellcounts"][name] = str(i)
		else:
			helper.return_error(qc_file + " file not found")
	
	# now add the qc metadata
	metrics.append({"qc_steps": []})
	details_path = os.path.join(dir_path, "qc_metrics.tsv")
	if os.path.isfile(details_path):
		with open(details_path) as f:
			# grab first line
			reader = csv.reader(f, delimiter="\t")
			header = next(reader)
			for row in reader:
				details = {
					"filtertype": row[0],
					"min": row[1],
					"max": row[2],
					"num_removed": row[3]
				}
				metrics[1]["qc_steps"].append(details)

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
	print(json.dumps(metrics))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
