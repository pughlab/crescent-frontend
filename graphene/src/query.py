from graphene import ObjectType, String, Field, ID
from schema.result import Result
from schema.minio_bucket import MinioBucket
from schema.loom_file import LoomFile
from minio_client.client import minio_client

# Define your queries and their resolvers here
class Query(ObjectType):
  # Field method specifies return type and arguments
  result = Field(Result, run_ID=ID(required=True))
  # Must have resolve_ prefix
  def resolve_result(parent, info, run_ID):
    return {'run_ID': run_ID}

  # A type definition and resolver for each field
  bucket = Field(MinioBucket, bucket_name=String(required=True))
  def resolve_bucket(parent, info, bucket_name):
    if minio_client.bucket_exists(bucket_name):
      return {'bucket_name': bucket_name}
    else:
      return None

  loom_file = Field(
    LoomFile,
    bucket_name=String(required=True),
    object_name=String(required=True))
  def resolve_loom_file(parent, info, bucket_name, object_name):
    return {'bucket_name': bucket_name, 'object_name': object_name}

