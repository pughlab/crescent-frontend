from graphene import Schema, Mutation, String, Field, ID, List

from pymongo import MongoClient
from bson.objectid import ObjectId
from os import environ

import sys
import json
from wes_client import util
from wes_client.util import modify_jsonyaml_paths

mongo_client = MongoClient(environ.get('MONGO_URL'))
db = mongo_client['crescent']

def makeJob(runId: str, datasetId: str, run: dict, dataName: str):
    # Job creation from mongo run data
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
    
        "minioInputPath": "minio/dataset-" + datasetId,
        "destinationPath": "minio/run-" + runId, 
        "access_key": environ["MINIO_ACCESS_KEY"],
        "secret_key": environ["MINIO_SECRET_KEY"],
        "minio_domain": "host.docker.internal",
        "minio_port": "9000"
    }
    job = json.dumps(job)
    return job


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
            datasetId = str(run['datasetIDs'][0])

            # Get the name of the dataset for the run from mongo
            name = db.datasets.find_one({'datasetID': ObjectId(datasetId)})['name']
            if name is None:
                print("dataset not found")
                return "dataset not found"
            # print(run)
            job = makeJob(runId = runId, datasetId = datasetId, run = run, dataName = name)
            print(job)
    #   # Uncomment when this resolver is connected to the frontend
    #   # Each run should only result in one submission, so this perserves idempotency
            if run['wesID'] is not None:
                print("A workflow has already been submitted for this run")
                return "A workflow has already been submitted for this run"

    
    #   # Get input paths
    #   pathToCWL = "/app/crescent/"
    #   pathToScript = "/app/crescent/Script/"

    #   # make request to wes
    #   clientObject = util.WESClient(
    #       {'auth': '', 'proto': 'http', 'host': "wes-server:" + environ['WES_PORT']}) # should come from env var
      
    #   # use seurat-workflow.cwl
    #   # All workflow related files must be passed as attachments here, excluding files in minio
    #   # To generalize to pipeline builder take all the arguments as inputs into the resolver, ie the cwl workflow, the job, and the attachments
    #   req = clientObject.run(
    #       pathToCWL + "seurat-workflow.cwl", job, [pathToScript + "Runs_Seurat_v3.R", pathToCWL + "extract.cwl", pathToCWL + "seurat-v3.cwl", pathToCWL + "upload.cwl", pathToCWL + "clean.cwl"])
    #   # Use the following line if you want to test with graphql playground
    #   # db.runs.find_one_and_update({'status': "completed"},{'$set': {'wesID': req["run_id"]}})
            # db.runs.find_one_and_update({'runID': ObjectId(runId)},{'$set': {'wesID': req["run_id"]}})
            # db.runs.find_one_and_update({'runID': ObjectId(runId)},{'$set': {'wesID': 'test'}})
    #   return SubmitRun(Wes_id = req["run_id"])
            return SubmitRun(wesId = 'test')
        except:
            e = sys.exc_info()[1]
            print(format(e))