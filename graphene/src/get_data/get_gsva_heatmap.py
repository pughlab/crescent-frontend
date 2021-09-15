#!/bin/python

import sys
import os
import json
import csv
import re

from get_data.get_client import get_minio_client
from get_data.helper import return_error, set_IDs, extract_cluster_label
from get_data.minio_functions import get_obj_as_2dlist, object_exists

def get_GSVA_heatmap_data(runID):
    """ given a runID, fetch the heatmap data """
    heatmap_data = {}
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ['enrichment_scores'])
    es = paths['enrichment_scores']
    minio_client = get_minio_client()
    if not object_exists(es['bucket'], es['object'], minio_client):
        return_error('Enrichment scores file not found')    
    
    es_tsv = get_obj_as_2dlist(es['bucket'], es['object'], minio_client)
    cell_types = es_tsv[0][1:] # cell types are first line
    es_tsv = es_tsv[1:]

    heatmap_data['type'] = 'heatmap'
    heatmap_data['x'] = cell_types
    heatmap_data['y'] = []
    heatmap_data['z'] = [] # this will contain the gsva values
    heatmap_data['hovertemplate'] = '<b>Cluster</b>: %{y}' + '<br><b>Cell Type</b>: %{x}' + '<br><b>Enrichment Score</b>: %{z}' + '<extra></extra>'

    multidataset_pattern = re.compile(r".*_(?P<cluster>.*)")
    for row in es_tsv:
        heatmap_data['y'].append(extract_cluster_label(row[0]))
        heatmap_data['z'].append(row[1:])

    return [heatmap_data]
