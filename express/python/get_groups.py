#!/bin/python

import sys
import os
import json
import csv

import helper

def read_groups_file(runID, projectID):
	""" given a runID, fetches the available groups to label cell barcodes by """
	groups_path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID) # default from pipeline
	metadata_path = "/usr/src/app/minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional, user-defined
	if not os.path.isfile(groups_path):
		# try command-line paths
		groups_path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		metadata_path = "../../minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional
		if not os.path.isfile(groups_path):
			helper.return_error("group label file not found ("+path+")")	
	
	with open(groups_path) as group_definitions:
		reader = csv.reader(group_definitions, delimiter="\t")
		available_groups = next(reader)[1:]

	if os.path.isfile(metadata_path):
		try:
			# open up and read the file
			with open(metadata_path) as metadata:
				reader = csv.reader(metadata, delimiter="\t")
				metadata_groups = next(reader)[1:]
			# merge in the metadata but keep existing order of columns
			for group in metadata_groups:
				if group not in available_groups:
					available_groups.append(col)
		except Exception as e:
			# this means the user-defined metadata is likely misconfigured, skip adding it
			pass
		
	return available_groups

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
		projectID = params['projectID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	groups = read_groups_file(runID,projectID)
	print(json.dumps({"groups": groups}))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
