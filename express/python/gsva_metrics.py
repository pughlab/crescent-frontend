#!/bin/python

import sys
import os
import json
import csv

import helper

def get_gsva_metrics(runID):
	""" given a runID, return the cells before and after filtering as well as data about the qc steps"""

	dir_path = "/usr/src/app/results/{runID}/GSVA/GSVA_RESULTS".format(runID=runID)
	if not os.path.isdir(dir_path):
		dir_path = "/usr/src/app/results/{runID}/GSVA/GSVA_RESULTS".format(runID=runID)
		if not os.path.isdir(dir_path):
			helper.return_error("GSVA results folder not found")

	if os.path.isfile(os.path.join(dir_path, "crescent.GSVA_final_label.tsv")):
			cluster_labels = []
			with open(os.path.join(dir_path, "crescent.GSVA_final_label.tsv")) as labels:
				reader = csv.reader(labels, delimiter="\t")
				for row in reader:
					cluster_labels.append({"cluster": str(row[0]), "value": row[1]})

	# now add the top enrichment scores
	cluster_scores = []
	if os.path.isfile(os.path.join(dir_path, "crescent.GSVA_enrichment_scores_sorted.tsv")):
		with open(os.path.join(dir_path, "crescent.GSVA_enrichment_scores_sorted.tsv")) as scores:
			reader = csv.reader(scores, delimiter="\t")
			header = next(reader)
			for row in reader:
				cluster = row[0].replace("C","")
				idx = next((i for i, item in enumerate(cluster_labels) if item["cluster"] == cluster), None)
				celltype_idx = header.index(cluster_labels[idx]['value'])
				cluster_labels[idx]['score'] = row[celltype_idx]

	return sorted(cluster_labels, key=lambda i:int(i['cluster']))

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	cluster_labels = get_gsva_metrics(runID)
	print(json.dumps(cluster_labels))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
