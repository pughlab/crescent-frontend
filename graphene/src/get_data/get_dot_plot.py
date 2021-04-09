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
from collections import OrderedDict
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
from get_data.helper import COLOURS, return_error, set_name_multi, set_IDs, sort_traces, calculate_n_th_percentile, merge_gsva
from get_data.minio_functions import count_lines, get_first_line, get_obj_as_2dlist, object_exists, group_exists
from get_data.get_others import get_paths

def get_barcodes(normalised_counts_path, feature_list):
    """ given a list of features, return all the barcodes for the features
    @rtype: [{'feature': str, 'barcode_exp': {barcode: exp}}]
    """
    with loompy.connect(normalised_counts_path) as ds:
        feature_barcodes = []
        barcodes = ds.ca.CellID
        features = ds.ra.Gene    

        # get all indices of the features in the loom file
        idx_feature_dict = OrderedDict()
        for feature in feature_list:
            feature_idx = next(
                (i for i in range(len(features)) if features[i] == feature), -1)
            if feature_idx >= 0:
                idx_feature_dict[feature_idx] = feature
                
        # sort the indices and find the corresponding barcodes and expression values
        sorted_idx_feature_dict = OrderedDict(sorted(idx_feature_dict.items(), key=lambda x: x[0]))
        rows = ds[sorted_idx_feature_dict.keys(), :]
        for i in range(len(rows)):
            feature_barcodes.append({"feature": list(sorted_idx_feature_dict.items())[i][1], "barcode_exp": dict(
                zip(barcodes, rows[i]))})

        return feature_barcodes

def categorize_by_group(group, barcode_exp_dict, label_tsv, include_unlabelled = False):
    """ return a dictionary containing all groups as keys and {barcode: exp} as values  """
    group_idx = label_tsv[0].index(str(group))
    group_type = label_tsv[1][group_idx]
    uncatogorized_barcodes = {key: True for key in barcode_exp_dict.keys()}
    cluster_dict = {}

    if group_type == 'numeric':
        return_error(group + " is numeric data, not viewable in dot plots")
    if group_type != 'group':
        return_error(group + " does not have a valid data type (must be 'group')")

    for row in label_tsv[2:]:
        barcode = str(row[0])
        if(uncatogorized_barcodes.pop(barcode, None)):
            label = str(row[group_idx])
            if label not in cluster_dict:
                cluster_dict[label] = {barcode: barcode_exp_dict[barcode]}
            else:
                cluster_dict[label][barcode] = barcode_exp_dict[barcode]
    if include_unlabelled:
        cluster_dict["unlabelled"] = {}
        for barcode in uncatogorized_barcodes:
            cluster_dict["unlabelled"][barcode] = barcode_exp_dict[barcode]
        
    return cluster_dict

def group_barcodes(barcode_exp_dict, minio_client, paths, group, runID):
    """ given all the barcodes for a feature({barcode: exp}), return the barcodes grouped by cluster
    @rtype: {cluster: {barcode: exp}} """

    metadata, groups, gsva = paths["metadata"], paths["groups"], paths["gsva"]

    metadata_exists = object_exists(metadata["bucket"], metadata["object"], minio_client)
    gsva_label_exists = object_exists(gsva["bucket"], gsva["object"], minio_client)

    if group == "GSVA Label":
        if gsva_label_exists:
            merged_groups_tsv = merge_gsva(get_obj_as_2dlist(groups["bucket"], groups["object"], minio_client), get_obj_as_2dlist(gsva["bucket"], gsva["object"], minio_client))
            return categorize_by_group(group, barcode_exp_dict, merged_groups_tsv)
        else:
            return_error("GSVA label is not available")
    elif (group_exists(group, groups, minio_client)):
        groups_tsv = get_obj_as_2dlist(groups["bucket"], groups["object"], minio_client)
        return categorize_by_group(group, barcode_exp_dict, groups_tsv)
    elif metadata_exists and (group_exists(group, metadata, minio_client)):
        metadata_tsv = get_obj_as_2dlist(metadata["bucket"], metadata["object"], minio_client)
        return categorize_by_group(group,barcode_exp_dict, metadata_tsv, True)
    else:
        return_error(group + " is not an available group in groups.tsv or metadata.tsv")

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
    try:
        avg_exp = total_exp/len(barcode_exp_dict.keys())
    except ZeroDivisionError:
        avg_exp = 0
    return avg_exp

def calculate_abundance(barcode_exp_dict):
    """ calculate abundance for a cluster 
    @barcode_exp_dict: {barcode: exp,} """
    num_expressed = 0
    for barcode in list(barcode_exp_dict.keys()):
        if barcode_exp_dict[barcode] != 0.0:
            num_expressed += 1
    try: 
        abundance = num_expressed/len(list(barcode_exp_dict.keys()))
    except ZeroDivisionError:
        abundance = 0
    return abundance

def count_cells(barcode_exp_dict):
    count = 0
    for barcode in list(barcode_exp_dict.keys()):
        count += 1
    return count

def get_trace(cluster_dict, feature, group, scale_by, slider_info):
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
        "globalmax": slider_info["global_max"],
        "initialminmax": slider_info["initial_min_max"]
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
        if slider_info["exp_range"] == [0, 0]:
            min_max_list = slider_info["initial_min_max"]
        else: # if max of exp_range is larger than global max, use global max
            min_max_list = [slider_info["exp_range"][0], min(slider_info["exp_range"][1], slider_info["global_max"])]
            
    template["marker"]["opacity"] = calculate_opacities(
        cluster_exp_dict, min_max_list)
    template["marker"]["size"] = calculate_sizes(
        cluster_abundance_dict)

    return template

def get_dot_plot_data(features, group, runID, scaleBy, expRange, assay):
    """ given a runID: returns a dot plot plotly object """

    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ["groups", "metadata", "normalised_counts", "gsva"], findDatasetID=False, assay=assay)
    paths["groups"] = set_name_multi(paths["groups"], "all", "groups")

    minio_client = get_minio_client()

    plotly_obj = []
    # Cases of input features:
    # [], return an empty list
    # ["gene1", "gene2"], return the specified features
    if(len(features) == 0):
        return plotly_obj
    
    feature_list = get_barcodes(paths["normalised_counts"], features)

    if(feature_list == []):
        return plotly_obj

    # find max avg expression
    avg_exp_list = [] # list of all average expression values
    feature_cluster_dict = {}
    for l in feature_list:
        cluster_dict = group_barcodes(
            l["barcode_exp"], minio_client, paths, group, runID)
        feature_cluster_dict[l["feature"]] = cluster_dict  
        for cluster in list(cluster_dict.keys()):
            avg_exp = calculate_avg_exp(cluster_dict[cluster])
            avg_exp_list.append(avg_exp)
    slider_info = {
        "exp_range": expRange,
        "global_max": 0 if not avg_exp_list else max(avg_exp_list),
        "initial_min_max": [calculate_n_th_percentile(10, avg_exp_list), calculate_n_th_percentile(90, avg_exp_list)]
    }

    # get trace for each feature
    for feature in list(feature_cluster_dict.keys()):
        cluster_dict = feature_cluster_dict[feature]
        trace = get_trace(cluster_dict, feature, group, scaleBy, slider_info)
        plotly_obj.append(trace)

    return plotly_obj