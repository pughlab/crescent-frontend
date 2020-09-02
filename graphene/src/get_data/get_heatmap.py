#!/bin/python

import sys
import os
import json
import csv

from get_data.get_client import get_minio_client
from get_data.helper import return_error, set_IDs
from get_data.minio_functions import get_obj_as_2dlist, object_exists

def get_heatmap_data(runID):
    """ given a runID, fetch the heatmap data """
    heatmap_data = {}

    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ['enrichment_scores'])
    es = paths['enrichment_scores']
    minio_client = get_minio_client()

    if not object_exists(es, minio_client):
        return_error('Heatmap scores file not found')    
    
    reader = get_obj_as_2dlist(es['bucket'], es['object'], minio_client)
    cell_types = reader[0][1:] # cell types are first line
    reader = reader[1:]

    heatmap_data['x'] = cell_types
    heatmap_data['y'] = []
    heatmap_data['text'] = []
    heatmap_data['hoverinfo'] = 'x+y+z'

    heatmap_data['z'] = [] # this will contain the gsva values
    for row in reader:
        cluster = row[0]
        heatmap_data['y'].append(cluster)
        heatmap_data['z'].append(row[1:])
        heatmap_data['text'].append(row[1:])

    heatmap_data['type'] = 'heatmap'
    return heatmap_data
