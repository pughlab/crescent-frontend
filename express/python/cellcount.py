#!/bin/python

import sys
import os
import json

def read_cellcount(runID):
	""" count the lines of the barcode groups file to determine the cellcount """
	
	path = "/usr/src/app/results/{runID}/SEURAT/frontend_groups/groups.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/frontend_groups/groups.tsv".format(runID=runID)
		if not os.path.isfile(path):
			helper.return_error("group label file not found ("+path+")")	
	
	with open(path) as group_definitions:
		for count, line in enumerate(group_definitions):
			pass
		return count # don't add one so header not counted

def main():
	try:
		# try to get the inputs
		params = json.loads(sys.argv[1])
		runID = params['runID']
	except Exception as e:
		error = {"error": "unable to read arguments: " + str(e)}
		print(json.dumps(error))
		sys.exit()

	cellcount = read_cellcount(runID)
	print(json.dumps({"cellcount": cellcount}))
	sys.stdout.flush()

if __name__ == "__main__":
    main()
