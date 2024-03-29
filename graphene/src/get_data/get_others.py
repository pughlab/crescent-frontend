import json
import re
from ordered_set import OrderedSet

from get_data.get_client import get_minio_client
from get_data.minio_functions import (
    count_lines,
    get_first_line,
    get_first_n_lines,
    get_list_of_object_names,
    get_obj_as_2dlist,
    get_obj_as_dictionary,
    get_size,
    object_exists
)
from get_data.helper import find_id, return_error, set_name_multi, set_IDs, set_name, natural_keys, extract_cluster_label

def get_paths(runID, keys, findDatasetID=False, assay="legacy"):
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    return set_IDs(paths, runID, keys, findDatasetID=findDatasetID, assay=assay)

def get_top_expressed_data(runID, datasetID, assay):
    """ given a runID get the top 10 expressed genes + their avg log fold change and p-value """
    paths = get_paths(runID, ["top_expressed"], assay=assay)
    paths["top_expressed"] = set_name_multi(paths["top_expressed"], datasetID, "top_expressed", assay=assay)
 
    minio_client = get_minio_client()

    result = []
    # open and parse
    try:
        top_two_markers = get_obj_as_2dlist(paths["top_expressed"]["bucket"], paths["top_expressed"]["object"], minio_client)
    except: 
        return[]
    header = top_two_markers[0]
    header[:] = ["p_val" if x=="p_val_adj" else x for x in header]
    top_two_markers = top_two_markers[1:]
    max_values = {'avg_logFC': 0, 'p_val': 0}
    inf_locations = [] # index and header of value "Inf" in avg_logFC or p_val columns
    for j in range(len(top_two_markers)):
        feature_result = {}
        for i in range(len(header)):
            value = top_two_markers[j][i]
            if value == 'Inf' and header[i] in ['avg_logFC', 'p_val']:
                inf_locations.append({"index": j, "header": header[i]})
            else:
                # deal with formatting for known columns
                if header[i] == 'avg_logFC':
                    value = round(float(value),3)
                    if value > max_values['avg_logFC']:max_values['avg_logFC'] = value
                elif header[i] == 'p_val':
                    if 'e' in value:
                        num, exp = value.split('e')
                        num = round(float(num),3)
                        value = str(num)+"e"+exp
                    else:
                        # if p-value not reported in sci. notation, format it to match
                        value = format(float(value), ".3e")
                    if float(value) > float(max_values['p_val']): max_values['p_val'] = value  
                feature_result[header[i]] = str(value)
        result.append(feature_result)
    # fill places with 'Inf' with max values
    for location in inf_locations:
            result[location['index']][location['header']] = max_values[location['header']]
    
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

def get_assays(runID):
    """ given a runID, return the available assay types """
    minio_client = get_minio_client()
    object_names = get_list_of_object_names("run-"+runID, minio_client)

    # determine whether the new file structure is used by checking if LOOM_FILES_CWL/ exits
    new_loom_pattern = re.compile(r".*LOOM_FILES_CWL/counts_(?P<assay>.*).loom")
    assays = []
    for object_name in object_names:
        match = new_loom_pattern.match(object_name)
        if match is not None:
            assays.append(match.groupdict()["assay"])
    if not assays:
        return ["legacy"]
    else: 
        return assays

def get_groups(runID, datasetID):
    """ given a runID, fetches the available groups to label cell barcodes by """
    return get_available_groups(runID, datasetID, "all")

def get_cellcount(runID):
    """ count the lines of the barcode groups file to determine the cellcount """
    minio_client = get_minio_client()
    paths = get_paths(runID, ["groups"])
    try: 
        return count_lines(paths["groups"]["bucket"], paths["groups"]["all"], minio_client) - 2
    except:
        return None

def get_plots(runID):
    minio_client = get_minio_client()
    paths = get_paths(runID, ["frontend_coordinates"])
    DESC = {}
    with open('get_data/desc.json') as desc_file:
        DESC = json.load(desc_file)

    # violin always available
    available_plots = []

    coordinates_pattern = re.compile(r".*frontend_coordinates/(?P<vis>.*)Coordinates.tsv")
    qc_pattern = re.compile(r".*frontend_qc.*")
    old_loom_pattern = re.compile(r".*frontend_normalized.*")
    new_loom_pattern = re.compile(r"LOOM_FILES_CWL/.*")
    gsva_heatmap_pattern = re.compile(r".*crescent.GSVA_enrichment_scores_sorted.tsv")
    infercnv_heatmap_pattern = re.compile(r".*infercnv.observations.tsv")
    object_names = get_list_of_object_names(paths["frontend_coordinates"]["bucket"], minio_client)

    for object_name in object_names:
        match = coordinates_pattern.match(object_name)
        loom_pattern_match = (old_loom_pattern.match(object_name) is not None) or (new_loom_pattern.match(object_name) is not None)
        if match is not None:
            vis = match.groupdict()["vis"]
            if vis in DESC:
                available_plots.append(vis)
        elif ("QC" not in available_plots) and (qc_pattern.match(object_name) is not None):
            available_plots.append("QC")
        elif ("VIOLIN" not in available_plots) and loom_pattern_match:
            available_plots.append("VIOLIN")
            available_plots.append("DOT")       
        elif ("GSVAHEATMAP" not in available_plots) and (gsva_heatmap_pattern.match(object_name) is not None):
            available_plots.append("GSVAHEATMAP")
        elif ("INFERCNVHEATMAP" not in available_plots) and (infercnv_heatmap_pattern.match(object_name) is not None):
            available_plots.append("INFERCNVHEATMAP")
    
    hardcoded_order = ["QC", "TSNE", "UMAP", "VIOLIN", "DOT", "GSVAHEATMAP", "INFERCNVHEATMAP"]
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

def get_groups_from_tsv(path, minio_client, group_type):
    if group_type == "all":
        groups = get_first_line(path["bucket"], path["object"], minio_client)[1:]
    else:
        tsv = get_first_n_lines(2, path["bucket"], path["object"], minio_client)
        group_types = list(zip(tsv[0], tsv[1]))[1:]
        groups = [group for group, grouptype in group_types if grouptype == group_type]
    return  groups

def get_available_groups(runID, datasetID, group_type):
    """ given a runID, fetches the available groups of type group, numeric or all """
    minio_client = get_minio_client()
    paths = get_paths(runID, ["groups", "metadata", "gsva"], findDatasetID=True)
    paths["groups"] = set_name_multi(paths["groups"], datasetID, "groups")
    groups, metadata, gsva = paths["groups"], paths["metadata"], paths["gsva"]

    # get avialable groups from groups.tsv
    groups = get_groups_from_tsv(groups, minio_client, group_type)
    # get available groups from metadata.tsv
    if(object_exists(metadata["bucket"], metadata["object"], minio_client)):
        metadata_groups = get_groups_from_tsv(metadata, minio_client, group_type)
        groups = list(OrderedSet(groups) | OrderedSet(metadata_groups))
    # get available groups from gsva tsv
    if object_exists(gsva["bucket"], gsva["object"], minio_client):
        groups.append("GSVA Label")
    return groups

def get_available_categorical_groups(runID, datasetID):
    """ given a runID, fetches the available groups (of non-numeric type) to label cell barcodes by """
    return get_available_groups(runID, datasetID, "group")

def get_available_numeric_groups(runID, datasetID):
    """ given a runID, fetches the available groups (of numeric type) to label cell barcodes by """
    minio_client = get_minio_client()
    paths = get_paths(runID, ["groups", "metadata"], datasetID=datasetID)
    paths["groups"] = set_name_multi(paths["groups"], datasetID, "groups")

    groups_tsv = get_first_n_lines(2, paths["groups"]["bucket"], paths["groups"]["object"], minio_client)
    group_types = list(zip(groups_tsv[0], groups_tsv[1]))[1:]
    groups = [group for group, grouptype in group_types if grouptype == 'numeric']

    metadata = paths["metadata"]
    
    if object_exists(metadata, minio_client):
        metadata_tsv = [[], []]
        if "buckets" in metadata:
            for bucket in metadata["buckets"]:
                first_2_lines = get_first_n_lines(2, bucket, metadata["object"], minio_client)
                metadata_tsv[0] += first_2_lines[0]
                metadata_tsv[1] += first_2_lines[1]
        else:
            metadata_tsv = get_first_n_lines(2, metadata["bucket"], metadata["object"], minio_client)
        metadata_types = list(zip(metadata_tsv[0], metadata_tsv[1]))[1:]
        metadata_groups = [group for group, grouptype in metadata_types if grouptype == 'numeric']
        return list(OrderedSet(groups) | OrderedSet(metadata_groups))
        # return list(OrderedDict.fromkeys(groups))+list(OrderedDict.fromkeys(metadata_groups))

    return numeric

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

def get_GSVA_metrics(runID):
    GSVA_metrics = []

    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ['enrichment_scores'])
    es = paths['enrichment_scores']
    minio_client = get_minio_client()
    if not object_exists(es['bucket'], es['object'], minio_client):
        return_error('Heatmap scores file not found')
    es_tsv = get_obj_as_2dlist(es['bucket'], es['object'], minio_client)

    cell_types = es_tsv[0][1:] # cell types are first line
    es_tsv = es_tsv[1:]
    for row in es_tsv:
        cluster = extract_cluster_label(row[0])
        scores = list(map(float, row[1:]))
        max_score_idx = row.index(str(max(scores)))
        GSVA_metrics.append({
            "cluster": cluster,
            "celltype": cell_types[max_score_idx-1],
            "score": row[max_score_idx]
        })
        
    GSVA_metrics.sort(key=lambda x: natural_keys(x["cluster"]))
    return GSVA_metrics

def get_sample_annots_data(runID):
    """ given a runID, fetch the sample annots data """
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ['infercnv_annotation'])
    annotation = paths['infercnv_annotation']
    
    minio_client = get_minio_client()
    if not object_exists(annotation['bucket'], annotation['object'], minio_client):
        '''
        Don't use:
            return_error('infercnv observation file not found')
        Otherwise, the GraphQL query may timeout. So, we simply return None.
        '''
        return None

    sample_annots_dict = get_obj_as_dictionary(annotation['bucket'], annotation['object'], minio_client, 0, 1)
    sample_annots = list(OrderedSet(sample_annots_dict.values()))
    return sample_annots

def get_inferCNV_types(runID):
    minio_client = get_minio_client()
    paths = get_paths(runID, ["frontend_coordinates"])
    DESC = {}
    with open('get_data/desc.json') as desc_file:
        DESC = json.load(desc_file)
    
    infercnv_type_pattern = re.compile(r"INFERCNV/INFERCNV/infercnv.(?P<type>[a-zA-Z]+).tsv")
    object_names = get_list_of_object_names(paths["frontend_coordinates"]["bucket"], minio_client)
    types = []
    count = 0
    for object_name in object_names:
        match = infercnv_type_pattern.match(object_name)
        if match is not None:
            types.append({
                "key": count,
                "text": match.groupdict()["type"],
                "value": match.groupdict()["type"],
            })
            count += 1
    return types
