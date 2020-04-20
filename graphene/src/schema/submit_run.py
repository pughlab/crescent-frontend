from graphene import Schema, Mutation, String, Field, ID, List

from pymongo import MongoClient
from os import environ

import sys
import json
from wes_client import util
from wes_client.util import modify_jsonyaml_paths

mongo_client = MongoClient(environ.get('MONGO_URL'))
db = mongo_client['crescent']

class SubmitRun(Mutation):
  # Subclass for describing what arguments mutation takes
  class Arguments:
    run_id = ID()

  # WES ID
  Output = ID

  # Resolver function with arguments
  def mutate(root, info, run_id):
    try:
      # Submit wes run and update using pymongo here
      print(db.runs.find_one())
      
      # Get input paths
      pathToCWL = "/app/crescent/"
      pathToScript = "/app/crescent/Script/"
      
      # Job creation
      job = {
          "R_script": {
              "class": "File",
              "path": "Script/Runs_Seurat_v3.R"
          },
          "R_dir": {
              "class": "Directory",
              "path": "Script"
          },
          "sc_input_type": "MTX", # should come from input
          "resolution": 1,
          "project_id": "frontend_example_mac_10x_cwl",
          "summary_plots": "n",
          "pca_dimensions": 10, # should come from input
          "percent_mito": "0,0.2", # should come from input
          "number_genes": "50,8000", # should come from input
          "minioInputPath": "minio/samples/", # should come from input
          "destinationPath": "minio/samples/runs/5e947ad79846b0010c6fad78", # should come from input
          "access_key": environ["MINIO_ACCESS_KEY"], # should come from env vars
          "secret_key": environ["MINIO_SECRET_KEY"], # should come from env vars
          "minio_domain": "host.docker.internal",
          "minio_port": "9000"
      }
      job = json.dumps(job)

      # make request to wes
      clientObject = util.WESClient(
          {'auth': '', 'proto': 'http', 'host': "wes-server:8081"}) 
      
      # use seurat-workflow.cwl
      # All workflow related files must be passed as attachments here, excluding files in minio
      # To generalize to pipeline builder take all the arguments as inputs into the resolver, ie the cwl workflow, the job, and the attachments
      req = clientObject.run(
          pathToCWL + "seurat-workflow.cwl", job, [pathToScript + "Runs_Seurat_v3.R", pathToCWL + "extract.cwl", pathToCWL + "seurat-v3.cwl", pathToCWL + "upload.cwl", pathToCWL + "clean.cwl"])

      return req
    except:
      print('submit run error')