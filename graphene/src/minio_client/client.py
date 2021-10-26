from minio import Minio
import os
minio_client = Minio(
  "{}:{}".format(
    os.getenv('MINIO_HOST_NAME_DEV') if os.getenv('NODE_ENV') == 'development' else os.getenv('MINIO_HOST_NAME_PROD'),
    os.getenv('MINIO_HOST_PORT')
  ),
  access_key=os.getenv('MINIO_ACCESS_KEY'),
  secret_key=os.getenv('MINIO_SECRET_KEY'),
  secure=True)