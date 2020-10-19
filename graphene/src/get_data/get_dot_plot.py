#!/bin/python

import json

"""
Run these if you need to run this file directly
Refer to https://chrisyeh96.github.io/2017/08/08/definitive-guide-python-imports.html#case-2-syspath-could-change
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
"""
# from get_data.get_client import get_minio_client
# from get_data.gradient import polylinear_gradient
# from get_data.helper import COLOURS, return_error, set_name_multi, set_IDs, sort_traces
# from get_data.minio_functions import count_lines, get_first_line, get_obj_as_2dlist, get_objs_as_2dlist, object_exists


def get_dot_plot_data(runID):
    """ given a runID: returns a dot plot plotly object """
    # paths = {}
    # with open('get_data/paths.json') as paths_file:
    #     paths = json.load(paths_file)
    # paths = set_IDs(paths, runID, ["groups", "metadata", "frontend_coordinates", "normalised_counts"], datasetID=datasetID)
    # paths["groups"] = set_name_multi(paths["groups"], datasetID, "groups")

    # minio_client = get_minio_client()
    cluster = [
        'cluster0',
        'cluster1',
        'cluster2',
        'cluster3',
        ]
    plotly_object =  [{
        "type": 'scatter',
        "x": ['PF4', 'PF4', 'PF4', 'PF4', 'PF4'],
        "y": cluster,
        "mode": 'markers',
        "marker": {
            "color":  ['#FD173D','#FD173D','#FD173D','#FD173D','#FD173D'],
            "symbol": 'circle',
            "size": [14, 30, 10, 20, 10],
            "opacity": [1, 0.8, 0.6, 0.4, 0.2]
        },
        },
        {
        "type": 'scatter',
        "x": ['FCGR3A','FCGR3A','FCGR3A','FCGR3A','FCGR3A'],
        "y": cluster,
        "mode": 'markers',
        "marker": {
            "color": ['#FD173D','#FD173D','#FD173D','#FD173D','#FD173D'],
            "symbol": 'circle',
            "size": [10, 20, 30, 40, 13],
            "opacity": [ 0.8, 0.6, 0.4, 1, 0.2]
        }
        },
        {
        "type": 'scatter',
        "x": ['PTPTRCAP','PTPTRCAP','PTPTRCAP','PTPTRCAP','PTPTRCAP'],
        "y": cluster,
        "mode": 'markers',
        "marker": {
            "color": ['#FD173D','#FD173D','#FD173D','#FD173D','#FD173D'],
            "symbol": 'circle',
            "size": [10, 25, 20, 23, 20],
            "opacity": [1, 0.8, 0.6, 0.4, 0.2]
        }
        },
        {
        "type": 'scatter',
        "x": ['IL32','IL32','IL32','IL32','IL32'],
        "y": cluster,
        "mode": 'markers',
        "marker": {
            "color": ['#FD173D','#FD173D','#FD173D','#FD173D','#FD173D'],
            "symbol": 'circle',
            "size": [30, 20, 15, 20, 12],
            "opacity": [0.5, 0.8, 0.6, 0.4, 0.2]
        }
        },
        {
        "type": 'scatter',
        "x": ['CCL5', 'CCL5', 'CCL5', 'CCL5', 'CCL5'],
        "y": cluster,
        "mode": 'markers',
        "marker": {
            "color": ['#FD173D','#FD173D','#FD173D','#FD173D','#FD173D'],
            "symbol": 'circle',
            "size": [25, 20, 23, 10, 30],
            "opacity": [1, 0.8, 0.6, 0.4, 0.2]
        }
        }]
    return plotly_object





