#!/bin/python

import os
import gzip

from minio import Minio
from minio import ResponseError

def get_client():
    return Minio(
        'minio:'+os.getenv('MINIO_HOST_PORT'),
        access_key=os.getenv('MINIO_ACCESS_KEY'),
        secret_key=os.getenv('MINIO_SECRET_KEY'),
        secure=False
    )

def object_exists(bucket, objct, minio_client):
    if (minio_client.bucket_exists(bucket)):
        for obj in minio_client.list_objects(bucket):
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
