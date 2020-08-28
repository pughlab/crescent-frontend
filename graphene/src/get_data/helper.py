#!/bin/python

import sys
import re
import json
from bson import ObjectId

from get_data.get_client import get_mongo_client

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

# Given a name that is prepended to files in frontend_groups find the corresponding datasetID
def find_id(name):
    client = get_mongo_client()
    db = client["crescent"]
    datasets = db["datasets"]
    return datasets.find_one({"name": name})["datasetID"]

def set_name(paths, datasetID, keys):
    client = get_mongo_client()
    db = client["crescent"]
    datasets = db["datasets"]
    name = datasets.find_one({"datasetID": ObjectId(datasetID)})["name"]
    for key in keys:
        paths[key]["object"] =  paths[key]["object"]["prefix"] + name + "_" + paths[key]["object"]["suffix"]
    return paths

def set_IDs(paths, runID, keys, findDatasetID=False):
    paths_required = {}

    if findDatasetID:
        # Currently set to getting the first dataset associated with run. Basically assumes there is only 1 dataset
        client = get_mongo_client()
        db = client['crescent']
        runs = db['runs']

        run_metadata = runs.find_one({'runID': ObjectId(runID)}) # Find run's metadata from runID
        datasetID = str(
            run_metadata
            ['datasetIDs'] # Get datasetIDs
            [0] # Get the first one
        ) # Get a string from the returned ObjectID
        datasetid_pattern = re.compile(r"(?P<pre>.*)(?P<run>dataset-)(?P<post>.*)")

    runid_pattern = re.compile(r"(?P<pre>.*)(?P<run>run-)(?P<post>.*)")

    for key in keys:
        if ("bucket" in paths[key]):
            match = runid_pattern.match(paths[key]["bucket"])
            if match is not None:
                groups = match.groupdict()
                paths[key]["bucket"] = "{0}run-{1}{2}".format(groups["pre"], runID, groups["post"])
                paths_required[key] = paths[key]
            elif findDatasetID:
                match = datasetid_pattern.match(paths[key]["bucket"])
                if match is not None:
                    groups = match.groupdict()
                    paths[key]["bucket"] = "{0}dataset-{1}{2}".format(groups["pre"], datasetID, groups["post"])
                    paths_required[key] = paths[key]
    if "normalised_counts" in keys:
        paths_required["normalised_counts"] = paths["normalised_counts"]["prefix"] + runID + paths["normalised_counts"]["suffix"]
    return paths_required
    
