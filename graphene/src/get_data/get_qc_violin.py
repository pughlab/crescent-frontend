#!/bin/python

import json
from copy import deepcopy

from get_data.get_client import get_minio_client
from get_data.helper import COLOURS, return_error, set_IDs, set_name
from get_data.minio_functions import get_first_line, get_obj_as_2dlist, object_exists

DEFAULT_VIOLIN = {
    "type": "violin",
    "points": "jitter",
    "jitter": 0.85,
    "text": [],
    "hoverinfo": "text+y",
    "points": "outliers",
    "meanline": {"visible": "true", "color":"black"},
    "x": [],
    "y": [],
    "marker": {"opacity": 0.05},
    "pointpos": 0
}

def intialize_traces(header):
    """ given a list of the column headers, intialize the list of trace objects """
    result = []
    count = 1
    for col in header:
        if col != 'Barcodes':
            before_trace = deepcopy(DEFAULT_VIOLIN)
            before_trace.update({
                "name": str(col)+"_Before",
                "xaxis": 'x'+str(count),
                "yaxis": 'y'+str(count),
                "line": {"color": COLOURS[0]},
            })
            result.append(before_trace)
            after_trace = deepcopy(DEFAULT_VIOLIN)
            after_trace.update({
                "name": str(col)+"_After",
                "xaxis": 'x'+str(count),
                "yaxis": 'y'+str(count),
                "line": {"color": COLOURS[1]},
            })
            result.append(after_trace)
            count += 1
    #print()

    return result

def get_qc_violin_data(runID, datasetID):
    """ before/after filtering is chosen plot"""
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ["before_filtering", "after_filtering"])
    paths = set_name(paths, datasetID, ["before_filtering", "after_filtering"])

    qc_files = ["before_filtering", "after_filtering"]

    minio_client = get_minio_client()

    traces = []

    for qc_file in qc_files:
        path = paths[qc_file]
        if (not object_exists(path["bucket"], path["object"], minio_client)):
            return_error("${file}.tsv file not found"
                .format(file=paths["object"].split('/')[-1]))
        
        header = get_first_line(path["bucket"], path["object"], minio_client)
        traces = intialize_traces(header) if not traces else traces
        reader = get_obj_as_2dlist(path["bucket"], path["object"], minio_client, include_header=False)
        for row in reader:
            for trace in traces:
                # only append to 'before' trace if using 'before' file & vice versa
                if trace['name'].split('_')[1] == 'Before' and qc_file == 'before_filtering':
                    trace['text'].append(row[header.index('Barcodes')])
                    trace['x'].append("Before QC")
                    trace['y'].append(row[header.index(trace['name'].split("_")[0])])
                elif trace['name'].split('_')[1] == 'After' and qc_file == 'after_filtering':
                    trace['text'].append(row[header.index('Barcodes')])
                    trace['x'].append("After QC")
                    trace['y'].append(row[header.index(trace['name'].split("_")[0])])
    return traces
