from graphene import Schema, Mutation, String, Field, ID, List

from minio import Minio
from minio.error import ResponseError

from ..types.minio_bucket import MinioBucket
from minio_client.client import minio_client

class CreateMinioBucket(Mutation):
  # Use minio bucket type definition to be returned when created
  Output = MinioBucket
  # Subclass for describing what arguments mutation takes
  class Arguments:
    bucket_name = String()
  # Resolver function with arguments
  def mutate(root, info, bucket_name):
    try:
      minio_client.make_bucket(bucket_name)
      return {'bucket_name': bucket_name}
    except ResponseError as err:
      print(err)