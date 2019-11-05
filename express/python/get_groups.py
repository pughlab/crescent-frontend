#!/bin/python

import sys
import os
import json
import csv

import helper

def read_groups_file(runID):
	""" given a runID, fetches the available groups to label cell barcodes by """
	path = "/usr/src/app/results/{runID}/groups.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/groups.tsv".format(runID=runID)
		if not os.path.isfile(path):
			helper.return_error("group label file not found ("+path+")")	
	
	with open(path) as group_definitions:
		reader = csv.reader(group_definitions, delimiter="\t")
		available_groups = next(reader)[1:]
	
	return available_groups

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	groups = read_groups_file(runID)
	print({"groups": groups})
	sys.stdout.flush()

if __name__ == "__main__":
    main()
