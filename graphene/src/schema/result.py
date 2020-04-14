from graphene import Schema, ObjectType, String, Field, ID
from .minio_bucket import MinioBucket
from minio import Minio
from minio.error import ResponseError
from minio_client.client import minio_client


# A type definition containing fields and resolvers
class Result(ObjectType):
  # This is resolved by Query.Result
  run_ID = ID()

  # This is resolved here at Result.bucket
  bucket = Field(MinioBucket)
  def resolve_bucket(parent, info):
    bucket_name = parent['run_ID']
    try:
      if minio_client.bucket_exists(bucket_name):
        return {'bucket_name': bucket_name}
    except ResponseError as err:
      print(err)
