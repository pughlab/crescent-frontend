#!/bin/python

import sys
import os
import json
import csv
import re

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
    if not object_exists(es['bucket'], es['object'], minio_client):
        return_error('Heatmap scores file not found')    
    
    es_tsv = get_obj_as_2dlist(es['bucket'], es['object'], minio_client)
    cell_types = es_tsv[0][1:] # cell types are first line
    es_tsv = es_tsv[1:]

    heatmap_data['x'] = cell_types
    heatmap_data['y'] = []
    heatmap_data['text'] = []
    heatmap_data['type'] = 'heatmap'
    heatmap_data['hovertemplate'] = '<b>Cluster</b>: %{y}' + '<br><b>Cell Type</b>: %{x}' + '<br><b>Enrichment Score</b>: %{z}' + '<extra></extra>'
    heatmap_data['z'] = [] # this will contain the gsva values

    multidataset_pattern = re.compile(r".*_(?P<cluster>.*)")
    for row in es_tsv:
        # get the cluster
        multidataset_match = multidataset_pattern.match(row[0])
        if multidataset_match is not None: # multi-dataset run
            heatmap_data['y'].append(multidataset_match.groupdict()["cluster"])
        else: # single dataset run
            heatmap_data['y'].append(row[0])
        heatmap_data['z'].append(row[1:])
        heatmap_data['text'].append(row[1:])

    return [heatmap_data]
