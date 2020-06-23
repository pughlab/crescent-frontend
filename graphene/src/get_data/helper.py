#!/bin/python

import sys
import os
import json
from operator import itemgetter
from pymongo import MongoClient
from bson import ObjectId

# plotly defaults
COLOURS = [
  '#1f77b4',  # muted blue
  '#ff7f0e',  # safety orange
  '#2ca02c',  # cooked asparagus green
  '#d62728',  # brick red
  '#9467bd',  # muted purple
  '#8c564b',  # chestnut brown
  '#e377c2',  # raspberry yogurt pink
  '#7f7f7f',  # middle gray
  '#bcbd22',  # curry yellow-green
  '#17becf'   # blue-teal
]

# Kelly's 22 colours of maximum contrast (1965), excluding black and white
# added plotly colours to kelly's 22 colours i.e. 17 unique colours
COLOURS = [
	# '#0067A5', # blue
	# '#F38400', # orange
	# '#008856', # green
	# '#BE0032', # red
	# '#875692', # purple
	# '#882D17', # reddish brown
	# '#E68FAC', # purplish pink
	# '#848482', # grey
	# '#F3C300', # yellow
	# '#A1CAF1', # light blue
	# '#C2B280', # tan
	# '#F99379', # yellowish pink
	# '#604E97', # violet
	# '#F6A600', # orange yellow
	# '#B3446C', # purplish red
	# '#DCD300', # greenish yellow
	# '#8DB600', # yellow green
	# '#654522', # yellowish brown
	# '#E25822', # reddish orange 
	# '#2B3D26' # olive green
  	'#1f77b4',  # muted blue
  	'#ff7f0e',  # safety orange
	'#2ca02c',  # cooked asparagus green
	'#d62728',  # brick red
	'#9467bd',  # muted purple
	'#17becf',  # blue-teal
	'#E68FAC',  # purplish pink
	'#F3C300',  # yellow
	'#8c564b',  # chestnut brown
	'#848482',  # grey
	'#DCD300',  # greenish yellow
	'#F99379',  # yellowish pink
	'#604E97',  # violet
	'#B3446C',  # purplish red
	'#C2B280',  # tan
	'#8DB600',  # yellow green
	'#654522',  # yellowish brown
	# '#E25822',  # reddish orange 
	'#2B3D26'  # olive green
]

def return_error(msg):
	""" format the error message and perform a system flush before exiting """
	print(json.dumps({"error": msg}))
	sys.stdout.flush()
	sys.exit()

def is_int(cluster_name):
	try:
		test = int(cluster_name)
	except ValueError as e:
		return False
	return True

def sort_traces(trace_objects):
	""" sort the lists of violin, opacity, or scatter objects by cluster name """
	# if all cluster names can be cast to int, sort by their integer value
	if all(is_int(x['name']) for x in trace_objects):
		trace_objects.sort(key=lambda i: int(i['name']))
	# otherwise, sort alphabetically
	else:
		trace_objects.sort(key=lambda i: i['name'])
	return 

def set_IDs(paths, runID):
	client = MongoClient(host='127.0.0.1', port=27017)
	db = client['crescent']
	runs = db['runs']

	# Currently set to getting the first dataset associated with run. Basically assumes there is only 1 dataset
	datasetID = str(
		runs.find_one({'runID': ObjectId(runID)}) # Find run's metadata from runID
		['datasetIDs'] # Get datasetIDs
		[0] # Get the first one
	) # Get a string from the returned ObjectID

	for path in paths.values():
		if ("bucket" in path):
			if(path["bucket"].startswith("run-")):
				path["bucket"] += runID
			elif(path["bucket"].startswith("dataset-")):
				path["bucket"] += datasetID
	paths["normalised_counts"] = paths["normalised_counts"]["prefix"] + runID + paths["normalised_counts"]["suffix"]

	return paths
	
