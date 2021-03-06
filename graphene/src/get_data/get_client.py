from minio import Minio
from pymongo import MongoClient
import os

# Switch the comented parts with the uncommented if you are wokring with CReSCENT

def get_mongo_client():
    return MongoClient(os.getenv('MONGO_URL'))
    # return MongoClient(host='127.0.0.1', port=27017)

def get_minio_client():
    # """
    return Minio(
        'minio:'+os.getenv('MINIO_HOST_PORT'),
        access_key=os.getenv('MINIO_ACCESS_KEY'),
        secret_key=os.getenv('MINIO_SECRET_KEY'),
        secure=False
    )
    """
    return Minio(
        "127.0.0.1:9000",
        access_key="crescent-access",
        secret_key="crescent-secret",
        secure=False
    )
    """
