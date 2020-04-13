import sys
import json
from wes_client import util
from wes_client.util import modify_jsonyaml_paths

# get input paths
pathToCWL = "/usr/src/app/crescent/"
pathToScript = "/usr/src/app/crescent/Script/"
pathToJob = sys.argv[1] + "/"
pathToInputFiles = sys.argv[2] + "/"

# open job file
inFile = open(pathToJob + "frontend_seurat_inputs.json", "r")
if inFile.mode == "r":
    job = inFile.read()

# Job creation needs to occur here instead of in submit.js for when we move from express to flask
# job = {
#     "R_script": {
#         "class": "File",
#         "path": "Script/Runs_Seurat_v3.R"
#     },
#     "R_dir": {
#         "class": "Directory",
#         "path": "Script"
#     },
#     "sc_input_type": "MTX", # should come from input
#     "resolution": 1,
#     "project_id": "frontend_example_mac_10x_cwl",
#     "summary_plots": "n",
#     "pca_dimensions": 10, # should come from input
#     "percent_mito": "0,0.2", # should come from input
#     "number_genes": "50,8000", # should come from input
#     "minioInputPath": "minio/project-5e4eeb54fee1bc004ceda65f/inputs/", # should come from input
#     "destinationPath": "minio/project-5e4eeb54fee1bc004ceda65f/runs/5e947ad79846b0010c6fad78", # should come from input
#     "access_key": "crescent-access", # should come from env vars
#     "secret_key": "crescent-secret", # should come from env vars
#     "minio_domain": "host.docker.internal",
#     "minio_port": "9000"
# }

job = json.dumps(job)

# make request to wes
clientObject = util.WESClient(
    {'auth': '', 'proto': 'http', 'host': "wes-server:8081"})

# use seurat-workflow.cwl
# All workflow related files must be passed as attachments here, excluding files in minio
req = clientObject.run(
    pathToCWL + "seurat-workflow.cwl", job, [pathToScript + "Runs_Seurat_v3.R", pathToCWL + "extract.cwl", pathToCWL + "seurat-v3.cwl", pathToCWL + "upload.cwl", pathToCWL + "clean.cwl"])