import sys
import json
from wes_client import util
from wes_client.util import modify_jsonyaml_paths

# get input paths
pathToCWL = "/usr/src/app/crescent/"
pathToJob = sys.argv[1] + "/"
pathToInputFiles = sys.argv[2] + "/"
#pathToInputFiles = "/usr/src/app/minio/download/test/"

print(pathToJob)
print(pathToInputFiles)

# open job file
inFile = open(pathToJob + "frontend_seurat_inputs.json", "r")
if inFile.mode == "r":
    job = inFile.read()

# make request to wes
clientObject = util.WESClient(
    {'auth': '', 'proto': 'http', 'host': "wes-server:8081"})
req = clientObject.run(
    pathToCWL + "seurat-v3.cwl", job, [pathToCWL + "Runs_Seurat_v3.R", pathToInputFiles + "barcodes.tsv.gz", pathToInputFiles + "features.tsv.gz", pathToInputFiles + "matrix.mtx.gz"])
