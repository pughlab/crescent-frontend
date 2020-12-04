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
from get_data.minio_functions import count_lines, get_first_line, get_obj_as_2dlist, get_objs_as_2dlist, object_exists
from get_data.get_others import get_top_expressed_data

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
                feature_barcodes.append({"feature": feature, "barcode_exp": dict(
                    zip(barcodes, ds[feature_idx, :]))})
        return feature_barcodes

def group_by_cluster(barcode_exp_dict, minio_client, groups_path, runID):
    """ given all the barcodes for a feature({barcode: exp}), return the barcodes grouped by cluster
    @rtype: {cluster: {barcode: exp}} """
    barcode_group_list = get_obj_as_2dlist(
        groups_path["bucket"] + runID, groups_path["all"], minio_client)
    cluster_dict = {}
    for i in range(len(barcode_group_list)):
        if i > 2: # headers takes up 2 rows
            line = barcode_group_list[i]
            cluster = line[1]
            if cluster not in cluster_dict:
                cluster_dict[cluster] = {line[0]: barcode_exp_dict[line[0]]}
            else:
                cluster_dict[cluster][line[0]] = barcode_exp_dict[line[0]]
    return cluster_dict

def sort_clusters(clusters):
    """ given a list of clusters, return a sorted list of clusters"""
    num_list = list(map(int, clusters))
    num_list.sort()
    str_list = list(map(str, num_list))
    return str_list

def duplicate_element(element, num):
    """ given an string, create a list with n copies of the string """
    result = []
    for i in range(num):
        result.append(element)
    return result

def calculate_opacities(cluster_exp_dict, max_exp):
    """ given a cluster expression dict, calculate and return the opacities of each cluster 
    @cluster_exp_dict: {cluster: exp} """
    min_opac = 0.05  # no expression
    exp_values = [float(cluster_exp_dict[cluster])
                  for cluster in list(cluster_exp_dict.keys())]
    opacities = [min_opac if val == 0.0 else round(
        (val*0.95/max_exp + min_opac), 2) for val in exp_values]
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

def find_max_exp(cluster_exp_dict):
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

def get_trace(cluster_dict, feature):
    """ given a cluster barcode dict, return a template trace object for one feature
    """
    sorted_clusters = sort_clusters(list(cluster_dict.keys()))
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
        "text": []
    }
    cluster_exp_dict = {}
    cluster_abundance_dict = {}
    for cluster in sorted_clusters:
        avg_exp = calculate_avg_exp(cluster_dict[cluster])
        cluster_exp_dict[cluster] = avg_exp
        abundance = calculate_abundance(cluster_dict[cluster])
        cluster_abundance_dict[cluster] = abundance
        template["text"].append([abundance*100, avg_exp, count_cells(cluster_dict[cluster])])
    
    max_exp = find_max_exp(cluster_exp_dict)
    template["marker"]["opacity"] = calculate_opacities(
        cluster_exp_dict, max_exp)
    template["marker"]["size"] = calculate_sizes(
        cluster_abundance_dict)

    return template


def get_top_per_cluster(runID):
    """ given a list of top expressed gene [{gene: str, cluster: str, p_val: str, avg_logFC: str}], 
    return the one with the highest avg_logFC per cluster """
    genes = get_top_expressed_data(runID, "all")
    for gene_data in genes:
        gene_data["num_avg_logFC"] = float(gene_data["avg_logFC"])
    sorted_genes = sorted(
        genes, key=lambda k: k["num_avg_logFC"], reverse=True)
    top_genes = []
    clusters = []
    for gene_data in sorted_genes:
        if(gene_data["cluster"] not in clusters):
            clusters.append(gene_data["cluster"])
            top_genes.append(gene_data["gene"])
    return top_genes

def get_dot_plot_data(features, runID):
    """ given a runID: returns a dot plot plotly object """
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    normalised_counts_path = paths["normalised_counts"]["prefix"] + \
        runID + paths["normalised_counts"]["suffix"]
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
        tops = get_top_per_cluster(runID)
        if(len(tops) <= 10):
            features_to_display = tops
        else:
            features_to_display = tops[:10]
    else:
        features_to_display = features
    feature_list = get_barcodes(normalised_counts_path, features_to_display)
    
    for l in feature_list:
        cluster_dict = group_by_cluster(
            l["barcode_exp"], minio_client, paths["groups"], runID)
        trace = get_trace(cluster_dict, l["feature"])
        plotly_obj.append(trace)
    return plotly_obj