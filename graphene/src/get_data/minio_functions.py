#!/bin/python

import os
import gzip

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
