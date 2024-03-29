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
def set_name_multi(path, datasetID, key, assay="legacy"):
    if (datasetID.lower() == "all"):
        if "infix" in path["object"]:
            path["object"] = path["object"]["prefix"] + path["object"]["infix"] + "_" + assay + path["object"]["suffix"]
        else:
            path["object"] = path["object"]["prefix"] + path["object"]["suffix"]
        return path
    else:
        # Create a copy in a format that set_name understands
        # Essentially it returns a {"bucket": bucket_name, "object": object_name}
        return set_name({key: path}, datasetID, [key])[key]

def set_name(paths, datasetID, keys, assay="legacy"):
    client = get_mongo_client()
    db = client["crescent"]
    datasets = db["datasets"]
    name = datasets.find_one({"datasetID": ObjectId(datasetID)})["name"]
    for key in keys:
        if "infix" in paths[key]["object"]:
            paths[key]["object"] = paths[key]["object"]["prefix"] + name + "_" + paths[key]["object"]["infix"] + "_" + assay + paths[key]["object"]["suffix"]
        else:
            paths[key]["object"] = paths[key]["object"]["prefix"] + name + "_" + paths[key]["object"]["suffix"]
    return paths

def set_IDs(paths, runID, keys, findDatasetID=False, assay='legacy'):
    paths_required = {}

    datasetID = ""
    if findDatasetID:
        # Currently set to getting the first dataset associated with run. Basically assumes there is only 1 dataset
        client = get_mongo_client()
        db = client['crescent']
        runs = db['runs']

        run_metadata = runs.find_one({'runID': ObjectId(runID)}) # Find run's metadata from runID
        datasetID = str(
            run_metadata
            # ['datasetIDs'] # Get datasetIDs
            # [0] # Get the first one
            ['projectID'] # Get projectID 
        ) # Get a string from the returned ObjectID
        # datasetid_pattern = re.compile(r"(?P<pre>.*)(?P<run>dataset-)(?P<post>.*)")
        datasetid_pattern = re.compile(r"(?P<pre>.*)(?P<run>project-)(?P<post>.*)")


    runid_pattern = re.compile(r"(?P<pre>.*)(?P<run>run-)(?P<post>.*)")

    for key in keys:
        curr_key = key + "_assay" if assay != 'legacy' and key in ["features", "normalised_counts", "top_expressed"] else key

        if ("bucket" in paths[curr_key]):
            match = runid_pattern.match(paths[curr_key]["bucket"])
            if match is not None:
                groups = match.groupdict()
                paths[curr_key]["bucket"] = "{0}run-{1}{2}".format(groups["pre"], runID, groups["post"])

                # Only for the key "normalised_counts" with a non-"legacy" assay
                if ("object" in paths[curr_key] and "suffix" in paths[curr_key]["object"] and curr_key == "normalised_counts_assay"):
                    paths[curr_key]["object"]["suffix"] = paths[curr_key]["object"]["suffix"].format(assay)

                paths_required[key] = paths[curr_key]
            elif findDatasetID:
                match = datasetid_pattern.match(paths[key]["bucket"])
                if match is not None:
                    groups = match.groupdict()
                    paths[key]["bucket"] = "{0}project-{1}{2}".format(groups["pre"], datasetID, groups["post"])
                    paths_required[key] = paths[key]
    return paths_required
    
def calculate_n_th_percentile(n, num_list):
    num_list.sort()
    index = round(n/100 * (len(num_list)+1))-1
    if index < 0 or not num_list:
        return 0
    elif index > len(num_list)-1:
        return num_list[len(num_list)-1]
    else: 
        return num_list[index]

def merge_gsva(groups_tsv, gsva_tsv):
    """ merge gsva_tsv with groups_tsv """
    gsva_dict = {}
    multidataset_pattern = re.compile(r".*_(?P<cluster>.*)")
    for line in gsva_tsv:
        multidataset_match = multidataset_pattern.match(line[0])
        if multidataset_match is not None: # multi-dataset run
            gsva_dict[(multidataset_match.groupdict()["cluster"])] = line[1]
        else: # single dataset run
            gsva_dict[line[0]] = line[1]

    merged_tsv = [['NAME', "GSVA Label"], ["TYPE", "group"]]
    barcode_idx, cluster_idx = 0, 1
    groups = groups_tsv[2:]
    for line in groups:
        new_line = [line[barcode_idx], gsva_dict[line[cluster_idx]]]
        merged_tsv.append(new_line)
    return merged_tsv
def to_float(text):
    try:
        result = float(text)
    except ValueError:
        result = text
    return result

def natural_keys(text):
    return [ to_float(c) for c in re.split(r'[+-]?([0-9]+(?:[.][0-9]*)?|[.][0-9]+)', text) ]

def extract_cluster_label(cluster):
    """ if '_' exists in cluster, extract the cluster cluster after '_' else return cluster """
    multidataset_pattern = re.compile(r".*_(?P<cluster>.*)")
    multidataset_match = multidataset_pattern.match(cluster)
    if multidataset_match is not None: # multi-dataset run
        return multidataset_match.groupdict()["cluster"]
    else: # single dataset run
        return cluster
