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
      # Use the following line if you want to test with graphql playground
      # run = db.runs.find_one({'status': "completed"})
      run = db.runs.find_one({'runID':run_id})

      param = json.loads(run['params'])
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
          "sc_input_type": param['singleCell'],
          "resolution": 1,
          "project_id": "frontend_example_mac_10x_cwl",
          "summary_plots": "n",
          "pca_dimensions": param['principalDimensions'],
          "percent_mito": str(param['percentMito']['min']) + "," + str(param['percentMito']['max']),
          "number_genes": str(param['numberGenes']['min']) + "," + str(param['numberGenes']['max']),
          "minioInputPath": "minio/samples/dataset-" + str(run['runID']) + "/", # should come from input
          "destinationPath": "minio/samples/runs/" + str(run['runID']), # should come from input
          "access_key": environ["MINIO_ACCESS_KEY"],
          "secret_key": environ["MINIO_SECRET_KEY"],
          "minio_domain": "host.docker.internal",
          "minio_port": "9000"
      }
      job = json.dumps(job)

      # make request to wes
      clientObject = util.WESClient(
          {'auth': '', 'proto': 'http', 'host': "wes-server:" + environ['WES_PORT']}) # should come from env var
      
      # use seurat-workflow.cwl
      # All workflow related files must be passed as attachments here, excluding files in minio
      # To generalize to pipeline builder take all the arguments as inputs into the resolver, ie the cwl workflow, the job, and the attachments
      req = clientObject.run(
          pathToCWL + "seurat-workflow.cwl", job, [pathToScript + "Runs_Seurat_v3.R", pathToCWL + "extract.cwl", pathToCWL + "seurat-v3.cwl", pathToCWL + "upload.cwl", pathToCWL + "clean.cwl"])
      # Use the following line if you want to test with graphql playground
      # db.runs.find_one_and_update({'status': "completed"},{'$set': {'wesID': req}})
      db.runs.find_one_and_update({'runID': run_id},{'$set': {'wesID': req}})
      return req
    except:
      e = sys.exc_info()[1]
      print(format(e))