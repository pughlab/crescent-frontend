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

mongo_client = MongoClient(environ.get('MONGO_URL'))
db = mongo_client['crescent']

def makeJob(runId: str, datasetId: str, run: dict, dataName: str):
    # Job creation from mongo run data, specific to Runs_Seurat_v3_SingleDataset.R
    job = {
        "R_script": {
            "class": "File",
            "path": "Script/Runs_Seurat_v3_SingleDataset.R"
        },
        "R_dir": {
            "class": "Directory",
            "path": "Script"
        },
        "sc_input_type": run['parameters']['quality'][datasetId]['sc_input_type'],
        "resolution": run['parameters']['clustering']['resolution'],
        "project_id": dataName,
        "pca_dimensions": run['parameters']['reduction']['pca_dimensions'],
        "normalization_method": run['parameters']['normalization']['normalization_method'],
        "return_threshold": run['parameters']['expression']['return_threshold'],
        "apply_cell_filters": run['parameters']['quality'][datasetId]['apply_cell_filters'],
        "percent_mito": str(run['parameters']['quality'][datasetId]['percent_mito']['min']) + "," + str(run['parameters']['quality'][datasetId]['percent_mito']['max']),
        "percent_ribo": str(run['parameters']['quality'][datasetId]['percent_ribo']['min']) + "," + str(run['parameters']['quality'][datasetId]['percent_ribo']['max']),
        "number_genes": str(run['parameters']['quality'][datasetId]['number_genes']['min']) + "," + str(run['parameters']['quality'][datasetId]['number_genes']['max']),
        "number_reads": str(run['parameters']['quality'][datasetId]['number_reads']['min']) + "," + str(run['parameters']['quality'][datasetId]['number_reads']['max']),        
        "save_unfiltered_data": run['parameters']['save']['save_unfiltered_data'],
        "save_filtered_data": run['parameters']['save']['save_filtered_data'],
        "save_r_object": run['parameters']['save']['save_r_object'],
    
        "minioInputPath": ["minio/dataset-" + datasetId],
        "destinationPath": "minio/run-" + runId, 
        "access_key": environ["MINIO_ACCESS_KEY"],
        "secret_key": environ["MINIO_SECRET_KEY"],
        "minio_domain": "host.docker.internal",
        "minio_port": environ["MINIO_HOST_PORT"]
    }

    # Return the json object, not a string
    return job

def makeMultiJob(runId: str, run: dict):
    # Job creation for multiple dataset run
    # Parse dge
    dge = run['parameters']['expression']['dge_comparisons']
    if len(run['parameters']['expression']['dge_comparisons']) > 1:
        dge = ",".join(run['parameters']['expression']['dge_comparisons'])

    # Add paths to pull from minio
    minioInputPaths = []
    for id in run['datasetIDs']:
        minioInputPaths.append("minio/dataset-" + str(id))
    # This must also be read from to retrieve datasets.csv
    minioInputPaths.append("minio/run-" + runId)
    # minioInputPaths = a list of strings of datasetIDs prepended with minio/dataset- and run
    
    job = {
        "R_script": {
            "class": "File",
            "path": "Script/Runs_Seurat_v3_MultiDatasets.R"
        },
        "resolution": run['parameters']['clustering']['resolution'],
        "project_id": "crescent",
        "pca_dimensions": run['parameters']['reduction']['pca_dimensions'],
        "return_threshold": run['parameters']['expression']['return_threshold'],
        "dge_comparisons": dge,
        "save_unfiltered_data": run['parameters']['save']['save_unfiltered_data'],
        "save_filtered_data": run['parameters']['save']['save_filtered_data'],
        "save_r_object": run['parameters']['save']['save_r_object'],

        "minioInputPath": minioInputPaths,
        "destinationPath": "minio/run-" + runId, 
        "access_key": environ["MINIO_ACCESS_KEY"],
        "secret_key": environ["MINIO_SECRET_KEY"],
        "minio_domain": "host.docker.internal",
        "minio_port": environ["MINIO_HOST_PORT"]
    }
    return job

def minioUpload(scriptPath: str, jsonPath: str, runId: str, csvPath = None):
    try:
        # Connect to minio
        minioEndpoint = 'host.docker.internal:' + environ["MINIO_HOST_PORT"]
        minioClient = Minio(minioEndpoint, environ["MINIO_ACCESS_KEY"], environ["MINIO_SECRET_KEY"], secure=False)

        # Upload R script and json inputs to minio
        bucket = "run-" + runId
        minioClient.fput_object(bucket, 'frontend_seurat_inputs.json', jsonPath)
        if csvPath is not None:
            minioClient.fput_object(bucket, 'datasets.csv', csvPath)
            minioClient.fput_object(bucket, 'Runs_Seurat_v3_MultiDatasets.R', scriptPath)
        else:
            minioClient.fput_object(bucket, 'Runs_Seurat_v3_SingleDataset.R', scriptPath)
        
        # Check if at least one sent corretly
        if minioClient.stat_object(bucket, "frontend_seurat_inputs.json") == None:
            return False
        return True
    except:
        # Catch connection and response errors
        e = sys.exc_info()[1]
        print(format(e))
        return False

def makeCSV(run: dict, datasetIDs: list, fileName: str):
    with open(fileName, mode = 'w') as csvfile:
        csvWriter = csv.writer(csvfile, delimiter=',')
        # First row
        csvWriter.writerow(["dataset_ID",
                            "name",
                            "dataset_type",
                            "dataset_format",
                            "mito_min",
                            "mito_max",
                            "ribo_min",
                            "ribo_max",
                            "ngenes_min",
                            "ngenes_max",
                            "nreads_min",
                            "nreads_max"])
        # Fill in each row for each dataset
        for dataset in run['parameters']['quality']:
            csvWriter.writerow(["dataset-" + dataset,
                                db.datasets.find_one({'datasetID': ObjectId(dataset)})['name'],
                                "type",
                                run['parameters']['quality'][dataset]["sc_input_type"],
                                run['parameters']['quality'][dataset]["percent_mito"]["min"],
                                run['parameters']['quality'][dataset]["percent_mito"]["max"],
                                run['parameters']['quality'][dataset]["percent_ribo"]["min"],
                                run['parameters']['quality'][dataset]["percent_ribo"]["max"],
                                run['parameters']['quality'][dataset]["number_genes"]["min"],
                                run['parameters']['quality'][dataset]["number_genes"]["max"],
                                run['parameters']['quality'][dataset]["number_reads"]["min"],
                                run['parameters']['quality'][dataset]["number_reads"]["max"],])
        csvfile.close()
    return fileName

class SubmitRun(Mutation):
    # Subclass for describing what arguments mutation takes
    class Arguments:
        runId = ID()

    # WES ID Output
    wesId = ID()

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

            # Single dataset version
            if not isMulti:
                # Parse datasetId to get the input files
                datasetId = str(run['datasetIDs'][0])

                # Get the name of the dataset for the run from mongo
                name = db.datasets.find_one({'datasetID': ObjectId(datasetId)})['name']
                if name is None:
                    print("dataset not found")
                    return "dataset not found"
                
                # Make the json input to the CWL workflow
                job = makeJob(runId = runId, datasetId = datasetId, run = run, dataName = name)
            # Multiple dataset version
            else:
                datasetIds = run['datasetIDs']
                job = makeMultiJob(runId= runId, run= run)
            # print (job)

    #   # Uncomment when this resolver is connected to the frontend
    #   # Each run should only result in one submission, so this perserves idempotency
            # if run['wesID'] is not None:
            #     print("A workflow has already been submitted for this run")
            #     return "A workflow has already been submitted for this run"

            # Create temp json file
            fileName = "frontend_seurat_inputs_" + runId + ".json"
            with open(fileName, 'w') as outfile:
                json.dump(job, outfile)
                outfile.close()
            
            # Also upload datasets.csv for multiple datasets
            if isMulti:
                fileName2 = "datasets_" + runId + ".csv"
                csv = makeCSV(run= run, datasetIDs= datasetIds, fileName= fileName2)
                
                # Upload files
                minioWorked = minioUpload(scriptPath= "/app/crescent/Script/Runs_Seurat_v3_MultiDatasets.R", jsonPath= fileName, runId= runId, csvPath= fileName2)
                # Delete temp csv
                remove(fileName2)
            else:
                # Upload files
                minioWorked = minioUpload(scriptPath= "/app/crescent/Script/Runs_Seurat_v3_SingleDataset.R", jsonPath= fileName, runId= runId)
            # Delete temp json file
            remove(fileName)

            # Check for errors in connecting/accessing minio
            if minioWorked == False:
                print("minio upload failed in submit_run.py")
                return "minio upload failed"
    
    #   # Get input paths
            pathToCWL = "/app/crescent/"
            pathToScript = "/app/crescent/Script/"

    #   # make request to wes
            clientObject = util.WESClient(
                {'auth': '', 'proto': 'http', 'host': "wes-server:" + environ['WES_PORT']}) # should come from env var
      
    #   # use seurat-workflow.cwl
    #   # All workflow related files must be passed as attachments here, excluding files in minio
    #   # To generalize to pipeline builder take all the arguments as inputs into the resolver, ie the cwl workflow, the job, and the attachments
            job = json.dumps(job)
            if not isMulti:
                req = clientObject.run(
                    pathToCWL + "seurat-workflow.cwl", job, [pathToScript + "Runs_Seurat_v3_SingleDataset.R", pathToCWL + "extract.cwl", pathToCWL + "seurat-v3.cwl", pathToCWL + "upload.cwl", pathToCWL + "clean.cwl"])
            else:
                req = clientObject.run(
                    pathToCWL + "seurat-workflow-multi.cwl", job, [pathToScript + "Runs_Seurat_v3_MultiDatasets.R", pathToCWL + "extract-multi.cwl", pathToCWL + "integrate-seurat-v3-wes.cwl", pathToCWL + "upload.cwl", pathToCWL + "clean.cwl"])

            db.runs.find_one_and_update({'runID': ObjectId(runId)},{'$set': {'wesID': req["run_id"], 'submittedOn': datetime.datetime.now()}})
            return SubmitRun(wesId = req["run_id"])
            # return SubmitRun(wesId = 'test')
        except:
            e = sys.exc_info()[1]
            print(format(e))