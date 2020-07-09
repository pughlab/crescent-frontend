import json
import os

from graphene import ObjectType

from get_data.get_client import get_minio_client
from get_data.helper import set_IDs
from get_data.minio_functions import get_all_lines

def binary_search(query, _list):
    if (query.lower() == _list[0].lower()):
        return 0
    elif (query.lower() == _list[-1].lower()):
        return len(_list) - 1
    else:
        first = 0
        last = len(_list) - 1
        while (last - first > 1):
            mid = int((first + last) / 2)
            if (_list[mid].lower() == query.lower()):
                return mid
            elif (_list[mid].lower() < query.lower()):
                first = mid
            else: # _list[mid].lower() > query.lower()
                last = mid
        return -1 # Not Found

def crawler(idx, query, _list):
    # Finds 3 more strings that also have the same prefix either above or below the index
    final_list = [idx]
    last_idx = len(_list) - 1
    for i in range(1, 3):
        prev_idx = idx - i

        if ((prev_idx >= 0) and _list[prev_idx].lower().startswith(query.lower())):
            final_list.append(prev_idx)
        if(len(final_list) == 4):
            final_list.sort()
            return final_list
        
        next_idx = idx + i

        if ((next_idx <= last_idx) and _list[next_idx].lower().startswith(query.lower())):
            final_list.append(next_idx)
        if(len(final_list) == 4):
            final_list.sort()
            return final_list
    final_list.sort()
    return final_list

def prefix_binary_search(query, _list):
    if (_list[0].lower().startswith(query.lower())):
        return crawler(0, query, _list)
    elif (_list[-1].lower().startswith(query.lower())):
        return crawler(len(_list) - 1, query, _list)
    else:
        first = 0
        last = len(_list) - 1
        while (last - first > 1):
            mid = int((first + last) / 2)
            if (_list[mid].lower().startswith(query.lower())):
                return crawler(mid, query, _list)
            elif (_list[mid].lower() < query.lower()):
                first = mid
            else: # _list[mid].lower() > query.lower()
                last = mid
        return [-1] # Not Found

def run_search(query, runID):
    # First check that query isn't blank
    if query == "":
        return [{'text': '', 'value': ''}]
    
    paths = {}
    with open('get_data/paths.json') as paths_file:
        paths = json.load(paths_file)
    paths = set_IDs(paths, runID, ["features"])

    minio_client = get_minio_client()

    features_list = get_all_lines(paths["features"]["bucket"], paths["features"]["object"], minio_client)

    search = binary_search(query, features_list)
    if (search >= 0):
        # We found a perfect match
        return [{'text': features_list[search], 'value': features_list[search]}]
    else:
        # Look for partial match where the query is a prefix, and match potential features
        search = prefix_binary_search(query, features_list)
        if (search != [-1]):
            result = []
            for idx in search:
                result.append({'text': features_list[idx], 'value': features_list[idx]})
            return result
        else:
            return [{'text': '', 'value': ''}]
