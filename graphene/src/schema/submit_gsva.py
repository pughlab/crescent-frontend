from graphene import Schema, Mutation, String, Field, ID, List

from pymongo import MongoClient
from bson.objectid import ObjectId
from os import environ, remove
import datetime

import sys
import json
import csv
from wes_client import util
from wes_client.util import modify_jsonyaml_paths

from minio import Minio
from minio.error import ResponseError

import socket

mongo_client = MongoClient(environ.get('MONGO_URL'))
db = mongo_client['crescent']

def makeGsvaJob(runId: str, run: dict):
    if (environ["GRAPHENE_DEV"] == "False"):
        with open('/app/src/schema/minioIP.txt', 'r') as file:
            minioIP = file.read().replace('\n', '')
    else:
        minioIP = "host.docker.internal"
    # Job creation for multiple dataset run, specific to Runs_Seurat_MultiDatasets.R

    # Add paths to pull from minio
    minioInputPaths = []
    minioInputPaths.append("minio/run-" + runId)
    
    # Filling in structure
    job = {
        # "anchors_function": run['parameters']['integration']['anchors_function'],
        # "reference_datasets": refDatasetIDs,
        # "assays_for_loom": "RNA,SCT",
        # "assays_for_dge" : "RNA,SCT",
        # "resolution": run['parameters']['clustering']['resolution'],
        # "pca_dimensions": run['parameters']['reduction']['pca_dimensions'],
        # "return_threshold": run['parameters']['expression']['return_threshold'],
        # "dge_comparisons": dge,
        # "save_unfiltered_data": run['parameters']['save']['save_unfiltered_data'],
        # "save_filtered_data": run['parameters']['save']['save_filtered_data'],
        # "save_r_object": run['parameters']['save']['save_r_object'],

        "project_id": "crescent",
        "matrix_input_type" : "DGE",
        "pvalue_cutoff" : 0.05,
        "fdr_cutoff" : 0.1,

        "minioInputPath": minioInputPaths,
        "destinationPath": "minio/run-" + runId, 
        "access_key": environ["MINIO_ACCESS_KEY"],
        "secret_key": environ["MINIO_SECRET_KEY"],
        "minio_domain": minioIP,
        "minio_port": environ["MINIO_HOST_PORT"]
    }
    return job

def minioUpload(scriptName: str, scriptPath: str, jsonPath: str, runId: str, csvPath = None):
    # Attempting to upload all relevant files neccesary for this run to the run bucket
    try:
        # Connect to minio
        minioEndpoint = 'crescent-dev.ccm.sickkids.ca:' + environ["MINIO_HOST_PORT"]
        minioClient = Minio(minioEndpoint, environ["MINIO_ACCESS_KEY"], environ["MINIO_SECRET_KEY"], secure=True)

        # Upload files to bucket
        bucket = "run-" + runId
        minioClient.fput_object(bucket, 'frontend_gsva_inputs.json', jsonPath)

        # Multi vs Single dataset
        # if csvPath is not None:
        #     minioClient.fput_object(bucket, 'datasets.csv', csvPath)
        #     minioClient.fput_object(bucket, 'Runs_Seurat_v3_MultiDatasets.R', scriptPath)

        minioClient.fput_object(bucket, 'Runs_GSVA.R', scriptPath)
        
        # Check if at least one sent corretly
        if minioClient.stat_object(bucket, "frontend_gsva_inputs.json") == None:
            return False
        return True
    except:
        # Catch connection and response errors
        e = sys.exc_info()[1]
        print(format(e))
        return False


class SubmitGsva(Mutation):
    # Subclass for describing what arguments mutation takes
    class Arguments:
        runId = ID()

    # WES ID Output
    wesID = ID()

    # Resolver function with arguments
    def mutate(root, info, runId):
        try:
            # Connect to mongo and get the run
            run = db.runs.find_one({'runID': ObjectId(runId)})
            if run is None:
                print("Run not found")
                return "Run not found"
            
            # Find out if we are dealing with multiple data sets
            isMulti = len(run['datasetIDs']) > 1
            

            job = makeGsvaJob(runId= runId, run= run)

            # Uncomment when this resolver is connected to the frontend
            # Each run should only result in one submission, so this perserves idempotency
            
            # if run['wesID'] is not None:
            #     print("A workflow has already been submitted for this run")
            #     return "A workflow has already been submitted for this run"

            # Sending files to minio
            # Create temp json file to send to minio
            fileName = "frontend_gsva_inputs_" + runId + ".json"
            with open(fileName, 'w') as outfile:
                json.dump(job, outfile)
                outfile.close()
            
            # Also upload datasets.csv for multiple datasets

            minioWorked = minioUpload(scriptName = "Runs_GSVA.R", scriptPath= "/app/crescent/Script/Runs_GSVA.R", jsonPath= fileName, runId= runId)
            # Delete temp json file
            remove(fileName)

            # Check for errors in connecting/accessing minio
            if minioWorked == False:
                print("minio upload failed in submit_run.py")
                return "minio upload failed"
    
            # Get input paths
            pathToCWL = "/app/crescent/"
            pathToGsvaCWL = "/app/crescent/gsvaCWL/"

            # Set up WESClient object
            clientObject = util.WESClient(
                {'auth': '', 'proto': 'http', 'host': environ['WES_SERVER'] + ":" + environ['WES_PORT']}) # should come from env var
      
            # Sending request to WES container
            # All workflow related files must be passed as attachments here, excluding files in minio such as the script and datasets
            job = json.dumps(job)

            req = clientObject.run(
                pathToGsvaCWL + "workflow-gsva.cwl", job, 
                [pathToGsvaCWL + "extract-gsva.cwl", 
                pathToGsvaCWL + "gsva.cwl",  
                pathToGsvaCWL + "upload-gsva.cwl"])

            # Update wesID and submitted on in mongo
            # db.runs.find_one_and_update({'runID': ObjectId(runId)},{'$set': {'wesID': req["run_id"], 'submittedOn': datetime.datetime.now(), 'status': 'submitted'}})
            db.runs.find_one_and_update({'runID': ObjectId(runId)}, {'$push': { 'secondaryRuns': {'$each': [{'wesID': req["run_id"], 'submittedOn': datetime.datetime.now(), 'completedOn': None, 'status': 'submitted'}]}}})

           
            # db.runs.updateOne({runID: ObjectId('6059156a2578b9004f98900a')}, {$push: {secondaryRuns: {$each: [{wesID: "5", status: "pending"}]}}}) 
            return SubmitGsva(wesID = req["run_id"])
            # return SubmitRun(wesID = 'test')
        except:
            e = sys.exc_info()[1]
            print(format(e))