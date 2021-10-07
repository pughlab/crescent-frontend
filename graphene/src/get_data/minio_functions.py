#!/bin/python

import os
import gzip
import loompy

from minio import Minio
from minio import ResponseError

def object_exists(bucket, objct, minio_client, recurse=True):
    if (minio_client.bucket_exists(bucket)):
        for obj in minio_client.list_objects(bucket, recursive=recurse):
            if (obj.object_name == objct):
                return True
    return False

def format_line_as_string_list(line):
    line = str(line) # Convert to string
    line = line[2:-1] # Remove b'' from b'<Stuff we need>'
    # Note: '\' is interpreted literally for some reason
    if (line.endswith("\\n")):
        line = line[:-2] # Remove \n from the end
    return line.split("\\t") # List with '\t' as seperator

def get_first_line(bucket, objct, minio_client, gzipped=False):
    if (gzipped):
        with gzip.open(minio_client.get_object(bucket, objct), 'rb') as data:
            first_line = data.readline()
    else:
        first_line = minio_client.get_object(bucket, objct).readline()
    return format_line_as_string_list(first_line)

def get_first_n_lines(n, bucket, objct, minio_client, gzipped=False):
    final_list = []
    if n <= 0:
        return []
    if (gzipped):
        with gzip.open(minio_client.get_object(bucket, objct), 'rb') as data:
            while not n == 0:
                final_list.append(format_line_as_string_list(data.readline()))
                n -= 1
    else:
        data = minio_client.get_object(bucket, objct)
        while not n == 0:
            final_list.append(format_line_as_string_list(data.readline()))
            n -= 1
    return final_list

def get_obj_as_2dlist(bucket, objct, minio_client, include_header=True, gzipped=False):
    obj = minio_client.get_object(bucket, objct)
    if(gzipped):
        with gzip.open(obj, 'rb') as data:
            if (not include_header):
                data.readline()
            _2dlist = [format_line_as_string_list(line) for line in data]
    else:
        if (not include_header):
            obj.readline()
        _2dlist = [format_line_as_string_list(line) for line in obj]
    return _2dlist


def get_obj_as_dictionary(bucket, objct, minio_client, key_index, value_index, include_header=True, gzipped=False):
    obj = minio_client.get_object(bucket, objct)
    _dict = {}
    if(gzipped):
        with gzip.open(obj, 'rb') as data:
            if (not include_header):
                data.readline()
            for line in data:
                string_list = format_line_as_string_list(line)
                _dict[string_list[key_index]] = string_list[value_index]
    else:
        if (not include_header):
            obj.readline()
        for line in obj:
            string_list = format_line_as_string_list(line)
            _dict[string_list[key_index]] = string_list[value_index]
    return _dict

def count_lines(bucket, objct, minio_client):
    obj = minio_client.get_object(bucket, objct)
    count = 0
    for line in obj:
        count += 1
    return count

def get_list_of_object_names(bucket, minio_client, prefix="", recursive=True):
    return list(
        map(
            lambda obj: obj.object_name, 
            minio_client.list_objects(bucket, prefix=prefix , recursive=recursive)
        )
    )

def get_all_lines(bucket, objct, minio_client, gzipped=False):
    list_2D = get_obj_as_2dlist(bucket, objct, minio_client, gzipped=gzipped)
    return [symbol_list[0] for symbol_list in list_2D]

def get_size(bucket, minio_client):
    total_size = 0
    objects = minio_client.list_objects(bucket, recursive=True)
    for objct in objects:
        total_size += objct.size
    return total_size

def group_exists(group, file, minio_client):
    """ return True if the specified tsv file exists and group in the header, otherwise return False """
    file_exists = object_exists(file["bucket"], file["object"], minio_client)
    return file_exists and group in get_first_line(file["bucket"], file["object"], minio_client)

def get_loompy_connect(normalised_counts_path, minio_client):
    # The MinIO bucket name
    minio_bucket_name = normalised_counts_path["bucket"]
    # The MinIO object name
    minio_object_name = normalised_counts_path["object"]["prefix"] + normalised_counts_path["object"]["suffix"]
    # The relative path for the loom file
    loom_path = os.path.join(
        "..",
        "minio",
        "upload",
        minio_bucket_name,
        minio_object_name
    )

    # Check if the loom file already exists
    if not os.path.isfile(loom_path):
        # If not, save the data from the MinIO object to a file (destination specified by loom_path)
        minio_client.fget_object(minio_bucket_name, minio_object_name, loom_path)
    
    # Return the connection to the loom file
    return loompy.connect(loom_path)