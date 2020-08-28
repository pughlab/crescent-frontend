import json
import re

from get_data.get_client import get_minio_client
from get_data.minio_functions import (
    count_lines,
    get_first_line,
    get_first_n_lines,
    get_list_of_object_names,
    get_obj_as_2dlist,
    get_size,
    object_exists
)
from get_data.helper import find_id, return_error, set_groups, set_IDs, set_name

def get_paths(runID, keys, findDatasetID=False):
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    return set_IDs(paths, runID, keys, findDatasetID=findDatasetID)

def get_top_expressed_data(runID):
    """ given a runID get the top 10 expressed genes + their avg log fold change and p-value """

    paths = get_paths(runID, ["top_expressed"])
    minio_client = get_minio_client()

    result = []
    # open and parse
    top_two_markers = get_obj_as_2dlist(paths["top_expressed"]["bucket"], paths["top_expressed"]["object"], minio_client)
    header = top_two_markers[0]
    top_two_markers = top_two_markers[1:]
    for row in top_two_markers:
        feature_result = {}
        for i in range(len(header)):
            value = row[i]
            # deal with formatting for known columns
            if header[i] == 'avg_logFC':
                value = round(float(value),3)
            elif header[i] == 'p_val':
                if 'e' in value:
                    num, exp = value.split('e')
                    num = round(float(num),3)
                    value = str(num)+"e"+exp
                else:
                    # if p-value not reported in sci. notation, format it to match
                    value = format(float(value), ".3e")
            feature_result[header[i]] = str(value)
        result.append(feature_result)

    return result 

def get_available_qc_data(runID, datasetID):
    dropdown_plots = {}
    with open('get_data/dropdown_plots.json') as dropdown_plots_file:
        dropdown_plots = json.load(dropdown_plots_file)
    
    minio_client = get_minio_client()
    paths = get_paths(runID, ["before_filtering", "after_filtering", "qc_data"])
    paths = set_name(paths, datasetID, ["before_filtering", "after_filtering", "qc_data"])

    available_plots = []
    # if both before and after tsv files exist, can show filtering
    if(object_exists(paths["before_filtering"]["bucket"], paths["before_filtering"]["object"], minio_client) and
       object_exists(paths["after_filtering"]["bucket"], paths["after_filtering"]["object"], minio_client)):
        available_plots.append(dropdown_plots['Before_After_Filtering'])
    else:
        return_error("QC results folder not found")
    
    if object_exists(paths["qc_data"]["bucket"], paths["qc_data"]["object"], minio_client):
        header = get_first_line(paths["qc_data"]["bucket"], paths["qc_data"]["object"], minio_client)
        for col in header:
            if col in dropdown_plots:
                available_plots.append(dropdown_plots[col])

    return available_plots

def get_groups(runID):
    """ given a runID, fetches the available groups to label cell barcodes by """
    minio_client = get_minio_client()
    paths = get_paths(runID, ["groups", "metadata"], findDatasetID=True)
    groups = paths["groups"]
    metadata = paths["metadata"]

    available_groups = get_first_line(groups["bucket"], groups["object"], minio_client)[1:]
    if(object_exists(metadata["bucket"], metadata["object"], minio_client)):
        metadata_groups = get_first_line(metadata["bucket"], metadata["object"], minio_client)[1:]
        available_groups = list(set(available_groups) | set(metadata_groups))
    
    return available_groups

def get_cellcount(runID):
    """ count the lines of the barcode groups file to determine the cellcount """
    minio_client = get_minio_client()
    paths = get_paths(runID, ["groups"])

    return count_lines(paths["groups"]["bucket"], paths["groups"]["object"], minio_client) - 2

def get_plots(runID):
    minio_client = get_minio_client()
    paths = get_paths(runID, ["frontend_coordinates"])
    DESC = {}
    with open('get_data/desc.json') as desc_file:
        DESC = json.load(desc_file)

    # violin always available
    available_plots = ["VIOLIN"]

    coordinates_pattern = re.compile(r".*frontend_coordinates/(?P<vis>.*)Coordinates.tsv")
    qc_pattern = re.compile(r".*frontend_qc.*")
    object_names = get_list_of_object_names(paths["frontend_coordinates"]["bucket"], minio_client)

    for object_name in object_names:
        match = coordinates_pattern.match(object_name)
        if match is not None:
            vis = match.groupdict()["vis"]
            if vis in DESC:
                available_plots.append(vis)
        elif ("QC" not in available_plots) and (qc_pattern.match(object_name) is not None):
            available_plots.append("QC")
    
    hardcoded_order = ["QC", "TSNE", "UMAP", "VIOLIN"]
    available_plots_with_data = []

    for vis in hardcoded_order:
        if vis in available_plots:
            available_plots_with_data.append(DESC[vis])
            available_plots.remove(vis)
    
    for vis in available_plots:
        available_plots_with_data.append(DESC[vis])

    return available_plots_with_data

def get_qc_metrics(runID, datasetID):
    minio_client = get_minio_client()
    paths = get_paths(runID, ["before_filtering", "after_filtering", "qc_metrics"])
    paths= set_name(paths, datasetID, ["before_filtering", "after_filtering", "qc_metrics"])

    metrics = {
        "cellcounts": {
            "Before": count_lines(paths["before_filtering"]["bucket"], paths["before_filtering"]["object"], minio_client) - 2,
            "After": count_lines(paths["after_filtering"]["bucket"], paths["after_filtering"]["object"], minio_client) - 2
        }
    }

    qc_steps = []
    frontend_qc = get_obj_as_2dlist(paths["qc_metrics"]["bucket"], paths["qc_metrics"]["object"], minio_client, include_header=False)

    for row in frontend_qc:
        qc_steps.append({
            "filtertype": row[0],
            "min": row[1],
            "max": row[2],
            "num_removed": row[3]
        })
    
    metrics["qc_steps"] = qc_steps

    return metrics

def get_available_categorical_groups(runID, datasetID):
    """ given a runID, fetches the available groups (of non-numeric type) to label cell barcodes by """
    minio_client = get_minio_client()
    paths = get_paths(runID, ["groups", "metadata"], findDatasetID=True)
    paths = set_groups(paths, datasetID)

    groups_tsv = get_first_n_lines(2, paths["groups"]["bucket"], paths["groups"]["object"], minio_client)
    group_types = list(zip(groups_tsv[0], groups_tsv[1]))[1:]
    groups = [group for group, grouptype in group_types if grouptype == 'group']
    
    if object_exists(paths["metadata"]["bucket"], paths["metadata"]["object"], minio_client):
        metadata_tsv = get_first_n_lines(2, paths["metadata"]["bucket"], paths["metadata"]["object"], minio_client)
        metadata_types = list(zip(metadata_tsv[0], metadata_tsv[1]))[1:]
        metadata_groups = [group for group, grouptype in metadata_types if grouptype == 'group']
        return list(set(groups) | set(metadata_groups))
    return groups

def total_size(runID):
    minio_client = get_minio_client()
    return get_size('run-'+str(runID), minio_client)

def get_diff_expression(runID):
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    groups = paths["groups"]
    minio_client = get_minio_client()

    # Resolving the runID
    runid_pattern = re.compile(r"(?P<pre>.*)(?P<run>run-)(?P<post>.*)")
    match = runid_pattern.match(groups["bucket"])
    if match is not None:
        group_dict = match.groupdict()
        groups["bucket"] = "{0}run-{1}{2}".format(group_dict["pre"], runID, group_dict["post"])

    group_objects = minio_client.list_objects_v2(groups["bucket"], prefix=groups["object"]["prefix"], recursive=True)
    group_filenames = [obj.object_name[len(groups["object"]["prefix"]):] for obj in group_objects] # Extract filenames from full paths
    diff_expression = []

    if ("groups.tsv" in group_filenames):
        diff_expression.append({
            "key": "All",
            "text": "All datasets",
            "value": "All"
        })
        group_filenames.remove("groups.tsv")
    
    # Extract name of dataset
    filename_pattern = re.compile(r"(?P<name>.*)(?P<suffix>_groups.tsv)")
    for filename in group_filenames:
        match = filename_pattern.match(filename)
        group_dict = match.groupdict()
        name = group_dict["name"]
        datasetID = find_id(name)
        diff_expression.append({
            "key": datasetID,
            "text": name,
            "value": datasetID
        })
    return diff_expression
