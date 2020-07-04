#!/bin/python

import json

from get_data.get_client import get_minio_client
from get_data.get_scatter import get_coordinates, label_with_groups
from get_data.helper import return_error, set_IDs
from get_data.minio_functions import count_lines, get_obj_as_2dlist, object_exists

def get_qc_scatter_data(qc_type, runID):
    """ scatter plot labelled with tsv of chosen type """
    if qc_type not in ['Number_of_Genes','Number_of_Reads','Mitochondrial_Genes_Percentage','Ribosomal_Protein_Genes_Percentage']:
        return_error(str(qc_type)+ " is not a valid option")
    
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ["frontend_coordinates", "groups", "qc_data"])

    minio_client = get_minio_client()

    barcode_coords = get_coordinates("UMAP", paths["frontend_coordinates"], minio_client)
    traces = {}
    num_cells = count_lines(paths["groups"]["bucket"], paths["groups"]["object"], minio_client) - 2

    if not object_exists(paths["qc_data"]["bucket"], paths["qc_data"]["object"], minio_client):
        return_error("qc_data.tsv file not found")
    qc_data = get_obj_as_2dlist(paths["qc_data"]["bucket"], paths["qc_data"]["object"], minio_client)

    if qc_type in qc_data[0]:
        label_with_groups(traces, barcode_coords, num_cells, qc_type, qc_data)
    else:
        return_error("selected QC data not found in file")
    
    return list(traces.values())[0]
