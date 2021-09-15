#!/bin/python

import sys
import os
import json
import csv
import re
import numpy as np

from get_data.get_client import get_minio_client
from get_data.helper import return_error, set_IDs, extract_cluster_label, set_name_multi
from get_data.minio_functions import get_obj_as_2dlist, get_obj_as_dictionary, object_exists

def get_inferCNV_heatmap_data(runID):
    """ given a runID, fetch the heatmap data """
    heatmap_data = {}
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ['infercnv', 'infercnv_gene_pos', 'infercnv_annotation'])
    infercnv, gene_pos, annotation = paths['infercnv'], paths['infercnv_gene_pos'], paths['infercnv_annotation']
    
    minio_client = get_minio_client()
    if not object_exists(infercnv['bucket'], infercnv['object'], minio_client):
        return_error('infercnv observation file not found')

    infercnv_tsv = get_obj_as_2dlist(infercnv['bucket'], infercnv['object'], minio_client)
    gene_pos_dict = get_obj_as_dictionary(gene_pos['bucket'], gene_pos['object'], minio_client, 0, 1)
    annotation_dict = get_obj_as_dictionary(annotation['bucket'], annotation['object'], minio_client, 0, 1)
    transposed_infercnv_tsv = np.array(infercnv_tsv).transpose() 

    heatmap_data['type'] = 'heatmap'
    heatmap_data['colorscale'] = [[0, "#00008b"], [0.5, "#fefeff"], [1, "#8b0000"]]
    heatmap_data['x'] = transposed_infercnv_tsv[0][1:]
    heatmap_data['y'] = []
    heatmap_data['z'] = []
    heatmap_data['text'] = []
    
    # for annotation
    heatmap_data['hovertext'] = [] 
    # for chromosome number
    heatmap_data['hovertemplate'] = '<b>Barcode</b>: %{y} (%{hovertext})' + '<br><b>Gene</b>: %{x} (%{text})' + '<br><b>Modified Expression</b>: %{z}' + '<extra></extra>'
    for barcode in infercnv_tsv[0][1:]:
        heatmap_data['text'].append([gene_pos_dict[gene] for gene in heatmap_data['x']])
    for barcode in infercnv_tsv[0][1:]:
        heatmap_data['hovertext'].append([annotation_dict[barcode] for gene in heatmap_data['x']])
    for row in transposed_infercnv_tsv[1:]:
        heatmap_data['y'].append(row[0])
        heatmap_data['z'].append(row[1:])
    return [heatmap_data]