from minio import Minio
import os
# minio_client = Minio(
#   'minio:'+os.getenv('MINIO_HOST_PORT'),
#   access_key=os.getenv('MINIO_ACCESS_KEY'),
#   secret_key=os.getenv('MINIO_SECRET_KEY'),
#   secure=False)

# For non-docker
minio_client = Minio(
  'crescent-dev.ccm.sickkids.ca:9000',
  access_key='minioadmin',
  secret_key='minioadmin',
  secure=True)