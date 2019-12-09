#!/bin/python

import sys
import os
import json
from operator import itemgetter

def get_cellcount(runID):
	""" given a runID, return the number of cells in the data """
	path = "/usr/src/app/results/{runID}/SEURAT/groups.tsv".format(runID=runID) 
	if not os.path.isfile(path):
		# try command-line path
		path = "../../results/{runID}/SEURAT/groups.tsv".format(runID=runID)
		if not os.path.isfile(path):
			return_error("group label file not found ("+path+")")	
	
	with open(path) as group_definitions:
		for count, line in enumerate(group_definitions):
			pass
		return count # don't add one so header not counted

def return_error(msg):
	""" format the error message and perform a system flush before exiting """
	print(json.dumps({"error": msg}))
	sys.stdout.flush()
	sys.exit()

def sort_traces(trace_objects):
	""" sort the lists of violin, opacity, or scatter objects by cluster name """
	trace_objects.sort(key=itemgetter('name'))
	return 
