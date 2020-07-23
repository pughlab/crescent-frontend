#!/bin/python

import json

"""
Run these if you need to run this file directly
Refer to https://chrisyeh96.github.io/2017/08/08/definitive-guide-python-imports.html#case-2-syspath-could-change
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
"""
from get_data.get_client import get_minio_client
from get_data.gradient import polylinear_gradient
from get_data.helper import COLOURS, return_error, set_IDs, sort_traces
from get_data.minio_functions import count_lines, get_first_line, get_obj_as_2dlist, object_exists

colour_dict = {}

def add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells):
    """ add a new barcode to the plotly object and add its label group if it doesn't exist yet """
    global colour_dict
    if (label in plotly_obj):
        plotly_obj[label]['text'].append(barcode)
        plotly_obj[label]['x'].append(barcode_coords[barcode][0])
        plotly_obj[label]['y'].append(barcode_coords[barcode][1])
        plotly_obj[label]['marker']['color'].append(colour_dict[label])
    else:
        # group not seen yet
        colour_dict[label] = COLOURS[len(colour_dict.keys())%len(COLOURS)]
        template_obj = {
            "name": label,
            "mode": "markers",
            "text": [barcode],
            "x": [barcode_coords[barcode][0]],
            "y": [barcode_coords[barcode][1]],
            "marker": {
                'color': [colour_dict[label]],
            },
        }
        if num_cells > 20000:
            # add different rendering to improve speeds
            template_obj["type"] = "scattergl"
        else:
            template_obj["type"] = "scatter"
        plotly_obj[label] = template_obj

def add_barcodes(plotly_obj, column_name, barcode_values, barcode_coords, num_cells, all_zeros):
    """ add all barcodes to the plotly object with their corresponding colour gradient based on value """    
    #colours = ['#ffde00', '#fa8a2b', '#e80000'] # any number of hex colours for gradient
    #colours = ['#6d2b82', '#85318a', '#9c3993', '#b2429b', '#c74da4', '#da59ac', '#ec68b4', '#f97abb', '#ff91c1']
    #colours = ['#200092', '#4f009c', '#7006a6', '#8d16b0', '#a726bb', '#c036c7', '#d748d4', '#ed59e3', '#ff6bff']
    #colours = ['#2a0d82', '#491796', '#6623aa', '#8130be', '#9c3fd0', '#b74fe1', '#d161ef', '#e975fa', '#ff8cff']
    #colours = ['#2a0d82', '#4f0e90', '#6e129e', '#8b1aaa', '#a625b5', '#c034be', '#d846c5', '#ed5bc8', '#ff72c7']
    colours = ['#dfdfdf', '#6435c9']
    #colours = ['#2a0d82', '#ff72c7']

    poly_gradient = polylinear_gradient(colours,len(barcode_values)+1)['hex']

    #colourscale = [[barcode_values[i][0], gradient[i]] for i in range(0,len(barcode_values))]

    template_obj = {
        "mode": "markers",
        "text": [],
        "hovertext": [],
        "marker": {
            'color': [], # put sorted markers' colours here from the gradient
            'colorscale':[[0, poly_gradient[0]],[1, poly_gradient[-1]]],
            #'colorscale': colourscale,
            'showscale': True
        },
        "x": [],
        "y": []
    }
    
    if num_cells > 20000:
        # set different rendering to improve speeds
        template_obj["type"] = "scattergl"
    else:
        template_obj["type"] = "scatter"

    gradient_iter = 0
    for barcode, value in barcode_values:
        template_obj["text"].append(barcode)
        template_obj["hovertext"].append(str(value)+" ("+column_name+")")
        template_obj["x"].append(barcode_coords[barcode][0])
        template_obj["y"].append(barcode_coords[barcode][1])
        template_obj["marker"]["color"].append(int(value))
        gradient_iter += 1

    if all_zeros:
        # artificially add 1 to fix scale
        template_obj["marker"]["color"].append(1)
    
    plotly_obj["numeric_data"] = template_obj
    return
    
def label_with_groups(plotly_obj, barcode_coords, num_cells, group, groups_tsv):
    # the chosen group is in the default groups.tsv file, metadata is irrelevant
    label_idx = groups_tsv[0].index(str(group)) # column index of group
    group_type = groups_tsv[1][label_idx] # datatype
    # construction of plotly object depends on group_type
    global colour_dict
    if group_type == 'group':
        # colour by discrete label
        for row in groups_tsv[2:]:
            barcode = str(row[0])
            label = str(row[label_idx])
            add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
    elif group_type == 'numeric':
        # colour by gradient, grab all data and sort it
        barcode_values = []
        all_ints = True
        all_zeros = True
        for row in groups_tsv[2:]:
            num_value = float(row[label_idx])
            all_ints = False if not num_value.is_integer() else all_ints
            all_zeros = False if not int(num_value) == 0 else all_zeros
            barcode_values.append((str(row[0]),num_value))
        barcode_values = sorted(barcode_values, key=lambda x: x[1])
        barcode_values = [(x,int(y)) for x, y in barcode_values] if all_ints else [(x,round(y, 2)) for x, y in barcode_values]
        add_barcodes(plotly_obj, group, barcode_values, barcode_coords, num_cells, all_zeros)
    else:
        colour_dict = {}
        return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")
    colour_dict = {}

def label_with_metadata(plotly_obj, barcode_coords, num_cells, group, groups_tsv, metadata_tsv):
    # the requested group is in the user-defined metadata.tsv
    label_idx = metadata_tsv[0].index(str(group)) # column index of group
    group_type = metadata_tsv[1][label_idx] # datatype
    # master dictionary of all barcodes with x,y coordinates for the selected scatterplot
    global colour_dict
    all_barcodes = {key: True for key in barcode_coords.keys()}
    if group_type == 'group':
        # colour by discrete label, for any barcode that doesn't have a label, give "NA"
        for row in metadata_tsv[2:]:
            barcode = str(row[0])
            if all_barcodes.pop(barcode, None):
                # exists in all barcodes, ok to add (will be skipped otherwise)
                label = str(row[label_idx])
                add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
        # remaining keys in the dictionary weren't defined in metadata file
        for barcode in all_barcodes.keys():
            label = 'unlabelled'
            add_barcode(plotly_obj, barcode, label, barcode_coords, num_cells)
    elif group_type == 'numeric':
        # colour by gradient, grab all data and sort it
        barcode_values = []
        all_ints = True # track if all the values can be cast to int
        for row in metadata_tsv[2:]:
            barcode = str(row[0])
            if all_barcodes.pop(barcode, None):
                # store (barcode,value) for every barcode in the master list
                num_value = float(row[label_idx])
                all_ints = False if not num_value.is_integer() else all_ints
                barcode_values.append((barcode,num_value))
        barcode_values = sorted(barcode_values, key=lambda x: x[1])
        # if all values are ints, cast them, otherwise round to 2 decimals
        barcode_values = [(x,int(y)) for x, y in barcode_values] if all_ints else [(x,round(y, 2)) for x, y in barcode_values]
        add_barcodes(plotly_obj, group, barcode_values, barcode_coords, num_cells, False)
    else:
        colour_dict = {}
        return_error(group + " does not have a valid data type (must be 'group' or 'numeric')")
    colour_dict = {}

def label_barcodes(barcode_coords, group, paths, minio_client):
    """ given the coordinates for the barcodes, sorts them into the specified groups and returns a plotly object """
    plotly_obj = {}
    metadata = paths["metadata"]
    groups = paths["groups"]
    
    groups_tsv = get_obj_as_2dlist(groups["bucket"], groups["object"], minio_client)
    num_cells = count_lines(groups["bucket"], groups["object"], minio_client) - 2
    metadata_exists = object_exists(metadata["bucket"], metadata["object"], minio_client)
    
    if group in groups_tsv[0]:
        # groups tsv definition supercedes metadata
        label_with_groups(plotly_obj, barcode_coords, num_cells, group, groups_tsv)
    elif (metadata_exists and (group in get_first_line(metadata["bucket"], metadata["object"], minio_client))):
        # it's defined in the metadata, need to merge with groups_tsv
        label_with_metadata(plotly_obj, barcode_coords, num_cells, group, groups_tsv,
            get_obj_as_2dlist(metadata["bucket"], metadata["object"], minio_client)
        )
    else:
        return_error(group + " is not an available group in groups.tsv or metadata.tsv")
    return list(plotly_obj.values())

def get_coordinates(vis, path, minio_client):
    """ given a visualization type, path of the coordinates file, and minio client gets the coordinates for each barcode and returns in dict """
    barcode_coords = {}
    
    coordinate_file = get_obj_as_2dlist(
        path["bucket"], "{path}{vis}Coordinates.tsv".format(path=path["object"], vis=vis.upper()),
        minio_client, include_header=False
    )
    for row in coordinate_file:
        barcode = row[0]
        if barcode in barcode_coords:
            return_error("duplicate barcode entry in Bucket: frontend_coordinates, Object: {vis}Coordinates.tsv".format(vis=vis.upper()))
        else:
            barcode_coords[barcode] = [round(float(row[1]), 3), round(float(row[2]), 3)]

    return barcode_coords

def get_scatter_data(vis, group, runID, datasetID):
    """ given a vistype grouping, and runID: returns the plotly object """
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ["groups", "metadata", "frontend_coordinates", "normalised_counts"], findDatasetID=True)

    minio_client = get_minio_client()
    
    barcode_coords = get_coordinates(vis, paths["frontend_coordinates"], minio_client)
    plotly_obj = label_barcodes(barcode_coords, group, paths, minio_client)
    try:
        sort_traces(plotly_obj)
    except:
        pass # this is fine, just means it's not sortable
    return plotly_obj
