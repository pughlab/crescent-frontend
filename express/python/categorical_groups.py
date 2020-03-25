#!/bin/python

import sys
import os
import json
import csv

import helper

def get_available_categorical_groups(runID, projectID):
	""" given a runID, fetches the available groups (of non-numeric type) to label cell barcodes by """
	groups_path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID) # default from pipeline
	metadata_path = "/usr/src/app/minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional, user-defined
	if not os.path.isfile(groups_path):
		# try command-line paths
		groups_path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		metadata_path = "../../minio/upload/project-{projectID}/metadata.tsv".format(projectID=projectID) # optional
		if not os.path.isfile(groups_path):
			helper.return_error("group label file not found ("+path+")")	
	
	with open(groups_path) as group_definitions:

		f = csv.reader(group_definitions, delimiter="\t")
		# pair the groups with their datatypes
		group_types = [(group, grouptype) for group, grouptype in zip(next(f),next(f))][1:]
		# only keep the ones with a non-numeric type (i.e. type is group)
		available_groups = [group for group, grouptype in group_types if grouptype == 'group'] 

	if os.path.isfile(metadata_path):
		try:
			# open up and read the file
			with open(metadata_path) as metadata:
				f = csv.reader(metadata, delimiter="\t")
				# pair the groups with their datatypes
				metadata_types = [(group, grouptype) for group, grouptype in zip(next(f),next(f))][1:]
				# only keep the ones with a non-numeric type (i.e. type is group)
				metadata_groups = [group for group, grouptype in metadata_types if grouptype == 'group']
			# merge in the metadata but keep existing order of columns
			for group in metadata_groups:
				if group not in available_groups:
					available_groups.append(group)
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

	groups = get_available_categorical_groups(runID, projectID)
	print(json.dumps({"groups": groups}))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
