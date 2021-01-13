#!/bin/python

import json
import numpy as np
import loompy
from minio import Minio
from minio.error import ResponseError
import os
import io
import csv
import gzip
import re
"""
Run these if you need to run this file directly
# case-2-syspath-could-change
Refer to https://chrisyeh96.github.io/2017/08/08/definitive-guide-python-imports.html
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
"""
from get_data.get_client import get_minio_client
from get_data.gradient import polylinear_gradient
from get_data.helper import COLOURS, return_error, set_name_multi, set_IDs, sort_traces
from get_data.minio_functions import count_lines, get_first_line, get_obj_as_2dlist, object_exists
from get_data.get_others import get_top_expressed_data, get_paths

def get_barcodes(normalised_counts_path, feature_list):
    """ given a list of features, return all the barcodes for the features
    @rtype: [{'feature': str, 'barcode_exp': {barcode: exp}}]
    """
    with loompy.connect(normalised_counts_path) as ds:
        feature_barcodes = []
        barcodes = ds.ca.CellID
        features = ds.ra.Gene    
        for feature in feature_list:
            feature_idx = next(
                (i for i in range(len(features)) if features[i] == feature), -1)
            if feature_idx >= 0:
                # ds[feature_idx, :] is taking 0.2s to calculate
                feature_barcodes.append({"feature": feature, "barcode_exp": dict(
                    zip(barcodes, ds[feature_idx, :]))})
        return feature_barcodes

def group_by_cluster(barcode_exp_dict, minio_client, groups_path, group, runID):
    """ given all the barcodes for a feature({barcode: exp}), return the barcodes grouped by cluster
    @rtype: {cluster: {barcode: exp}} """
    barcode_group_list = get_obj_as_2dlist(
        groups_path["bucket"], groups_path["all"], minio_client)
    cluster_dict = {}
    group_header = barcode_group_list[0]
    group_column_idx = group_header.index(group) if group in group_header else 1
    for i in range(len(barcode_group_list)):
        if i > 2: # headers takes up 2 rows
            line = barcode_group_list[i]
            cluster = line[group_column_idx]
            if cluster not in cluster_dict:
                cluster_dict[cluster] = {line[0]: barcode_exp_dict[line[0]]}
            else:
                cluster_dict[cluster][line[0]] = barcode_exp_dict[line[0]]
    return cluster_dict

def to_float(text):
    try:
        result = float(text)
    except ValueError:
        result = text
    return result

def natural_keys(text):
    return [ to_float(c) for c in re.split(r'[+-]?([0-9]+(?:[.][0-9]*)?|[.][0-9]+)', text) ]

def duplicate_element(element, num):
    """ given an string, create a list with n copies of the string """
    result = []
    for i in range(num):
        result.append(element)
    return result

def calculate_opacities(cluster_exp_dict, min_max_list):
    """ given a cluster expression dict, calculate and return the opacities of each cluster 
    @cluster_exp_dict: {cluster: exp} """
    min_opac = 0.05  # no expression
    exp_values = [float(cluster_exp_dict[cluster])
                  for cluster in list(cluster_exp_dict.keys())]

    normalised_exp_values = []
    for value in exp_values:
        if value > min_max_list[1]:
            normalised_exp_values.append(min_max_list[1])
        elif value < min_max_list[0]:
            normalised_exp_values.append(min_max_list[0])
        else:
            normalised_exp_values.append(value)
    opacities = [min_opac if val == min_max_list[0] else round(
        (val*0.95/min_max_list[1] + min_opac), 2) for val in normalised_exp_values]

    return opacities

def calculate_sizes(cluster_exp_dict):
    """ given a cluster expression dict, calculate and return the sizes of each cluster 
    @cluster_exp_dict: {cluster: exp} """
    min_size = 10  # 0% expressed
    size_values = [float(cluster_exp_dict[cluster])
                   for cluster in list(cluster_exp_dict.keys())]
    sizes = [min_size if val == 0.0 else round(
        (val*40/1 + min_size), 2) for val in size_values]
    return sizes

def find_max_exp_per_cluster(cluster_exp_dict):
    """ for a feature, find the max average expression value """
    max = 0.0
    for cluster in list(cluster_exp_dict.keys()):
        if cluster_exp_dict[cluster] > max:
            max = cluster_exp_dict[cluster]
    return max

def calculate_avg_exp(barcode_exp_dict):
    """ calculate average expression for a cluster 
    @barcode_exp_dict: {barcode: exp} """
    total_exp = 0.0
    for barcode in list(barcode_exp_dict.keys()):
        total_exp += barcode_exp_dict[barcode]
    return total_exp/len(barcode_exp_dict.keys())

def calculate_abundance(barcode_exp_dict):
    """ calculate abundance for a cluster 
    @barcode_exp_dict: {barcode: exp,} """
    num_expressed = 0
    for barcode in list(barcode_exp_dict.keys()):
        if barcode_exp_dict[barcode] != 0.0:
            num_expressed += 1
    return num_expressed/len(list(barcode_exp_dict.keys()))

def count_cells(barcode_exp_dict):
    count = 0
    for barcode in list(barcode_exp_dict.keys()):
        count += 1
    return count

def get_trace(cluster_dict, feature, group, scale_by, global_max_avg_exp, exp_range):
    """ given a cluster barcode dict, return a template trace object for one feature
    """
    sorted_clusters = sorted(list(cluster_dict.keys()), key=natural_keys)
    template = {
        "type": 'scatter',
        "x": duplicate_element(feature, len(cluster_dict.keys())),
        "y": sorted_clusters,
        "mode": 'markers',
        "marker": {
                "color":  '#f5527b',
                "symbol": 'circle',
                "size": [],
                "opacity": [],
                # "colorscale": [[0, '#ffe9ec'], [1, '#f5527b']],
                # "showscale": True,
        },
        "hovertemplate": '<b>Percent Expressed</b>: %{text[0]: .2f}%' +
            '<br><b>Avg Expression</b>: %{text[1]: .2f}' + 
            '<br><b>Number of Cells</b>: %{text[2]}' + 
            '<extra>Cluster %{y}<br>Gene %{x}</extra>',
        "text": [],
        "group": group,
        "scaleby": scale_by,
        "globalmax": global_max_avg_exp
        
    }
    cluster_exp_dict = {}
    cluster_abundance_dict = {}
    for cluster in sorted_clusters:
        avg_exp = calculate_avg_exp(cluster_dict[cluster])
        cluster_exp_dict[cluster] = avg_exp
        abundance = calculate_abundance(cluster_dict[cluster])
        cluster_abundance_dict[cluster] = abundance
        template["text"].append([abundance*100, avg_exp, count_cells(cluster_dict[cluster])])

    if scale_by == "gene":
        min_max_list = [0, find_max_exp_per_cluster(cluster_exp_dict)] # max avg exp per cluster
    else:
        if exp_range == [0, 0]:
            min_max_list = [0, global_max_avg_exp]
        else: # if max of exp_range is larger than global max, use global max
            min_max_list = [exp_range[0], min(exp_range[1], global_max_avg_exp)]
            
    template["marker"]["opacity"] = calculate_opacities(
        cluster_exp_dict, min_max_list)
    template["marker"]["size"] = calculate_sizes(
        cluster_abundance_dict)

    return template

def get_top_ten_expressed_genes(runID, minio_client):
    
    """ given a runID get the top 10 expressed genes + their avg log fold change and p-value """
    paths = get_paths(runID, ["top_expressed"], datasetID="all")
    paths["top_expressed"] = set_name_multi(paths["top_expressed"], "all", "top_expressed")

    result = []
    # open and parse
    try: 
        top_two_markers = get_obj_as_2dlist(paths["top_expressed"]["bucket"], paths["top_expressed"]["object"], minio_client)
    except: # file not found
        return []
    header = top_two_markers[0]
    top_two_markers = top_two_markers[1:]
    genes_data = [] #[{gene: __, avg_logFC: __},]
    for row in top_two_markers:
        gene_data = {}
        for i in range(len(header)):
            value = row[i]
            if header[i] == 'avg_logFC':
                value = round(float(value),3)
                gene_data['avg_logFC'] = value
            elif header[i] == 'gene':
                gene_data['gene'] = value
        genes_data.append(gene_data)
    
    # sort all the genes
    sorted_genes_data = sorted(
        genes_data, key=lambda k: k["avg_logFC"], reverse=True)
    sorted_genes = [data["gene"] for data in sorted_genes_data][0:10]
    return sorted_genes

def get_dot_plot_data(features, group, runID, scaleBy, expRange):
    """ given a runID: returns a dot plot plotly object """

    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ["groups", "metadata", "normalised_counts"], datasetID="all")
    # paths["groups"] = set_name_multi(paths["groups"], datasetID, "groups")

    minio_client = get_minio_client()

    plotly_obj = []
    # Cases of input features:
    # [], return the defualt features
    # ["none"], return an empty list
    # ["none", "gene1"], ignore "none" and return the specified features
    if(features == ["none"]):
        return plotly_obj
    elif(len(features) == 0):
        # limit the num of default genes to 10
        features_to_display = get_top_ten_expressed_genes(runID, minio_client)
    else:
        features_to_display = features
    
    feature_list = get_barcodes(paths["normalised_counts"], features_to_display)

    if(feature_list == []):
        return plotly_obj

    # find max avg expression
    avg_exp_list = []
    feature_cluster_dict = {}
    for l in feature_list:
        cluster_dict = group_by_cluster(
            l["barcode_exp"], minio_client, paths["groups"], group, runID)
        feature_cluster_dict[l["feature"]] = cluster_dict  
        for cluster in list(cluster_dict.keys()):
            avg_exp = calculate_avg_exp(cluster_dict[cluster])
            avg_exp_list.append(avg_exp)
    global_max_exp = max(avg_exp_list)

    # get trace for each feature
    for feature in list(feature_cluster_dict.keys()):
        cluster_dict = feature_cluster_dict[feature]
        trace = get_trace(cluster_dict, feature, group, scaleBy, global_max_exp, expRange)
        plotly_obj.append(trace)
    
    return plotly_obj