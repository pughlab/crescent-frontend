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

# If datasetID is 'all' then use the default path which is prefix+suffix. Else query for the dataset_id
def set_name_multi(path, datasetID, key):
    if (datasetID.lower() == "all"):
        path["object"] = path["object"]["prefix"] + path["object"]["suffix"]
        return path
    else:
        # Create a copy in a format that set_name understands
        # Essentially it returns a {"bucket": bucket_name, "object": object_name}
        return set_name({key: path}, datasetID, [key])[key]

def set_name(paths, datasetID, keys):
    client = get_mongo_client()
    db = client["crescent"]
    datasets = db["datasets"]
    name = datasets.find_one({"datasetID": ObjectId(datasetID)})["name"]
    for key in keys:
        paths[key]["object"] = paths[key]["object"]["prefix"] + name + "_" + paths[key]["object"]["suffix"]
    return paths

def set_IDs(paths, runID, keys, datasetID=""):
    paths_required = {}

    runid_pattern = re.compile(r"(?P<pre>.*)(?P<run>run-)(?P<post>.*)")
    datasetid_pattern = re.compile(r"(?P<pre>.*)(?P<dataset>dataset-)(?P<post>.*)")

    for key in keys:
        if (key == "normalised_counts"):
            paths_required[key] = paths[key]["prefix"] + runID + paths[key]["suffix"]
        elif (key == "metadata"):
            match = datasetid_pattern.match(paths[key]["bucket"])
            if (datasetID == ""):
                return_error("Blank Dataset ID given for metadata")
            elif match is None:
                return_error("Metadata bucket name does not match expected datasetid_pattern")
            elif (datasetID.lower() == "all"):
                group_dict = match.groupdict()

                # Get datasetIDs for this run
                client = get_mongo_client()
                db = client["crescent"]
                runs = db["runs"]
                run_metadata = runs.find_one({"runID": ObjectId(runID)}) # Find run's metadata from runID

                paths[key]["buckets"] = ["{0}{1}{2}{3}".format(group_dict["pre"], group_dict["dataset"], str(dID), group_dict["post"]) for dID in run_metadata['datasetIDs']] # Get a string from the returned ObjectIDs
            else:
                group_dict = match.groupdict()
                paths[key]["bucket"] = "{0}{1}{2}{3}".format(group_dict["pre"], group_dict["dataset"], datasetID, group_dict["post"])
            
            paths_required[key] = paths[key]

        else:
            match = runid_pattern.match(paths[key]["bucket"])
            if match is not None:
                groups = match.groupdict()
                paths[key]["bucket"] = "{0}{1}{2}{3}".format(groups["pre"], groups["run"], runID, groups["post"])
                paths_required[key] = paths[key]
    return paths_required
    
