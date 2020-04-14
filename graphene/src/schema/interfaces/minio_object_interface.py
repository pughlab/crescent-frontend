import graphene
from graphene import ObjectType, Interface, String, Field, ID, List, Int

from minio import Minio
from minio.error import ResponseError
from minio_client.client import minio_client

class MinioObjectInterface(Interface):
  # Fields that would need trivial resolvers
  # (may need to be changed if MinioObject becomes queryable on graph)
  bucket_name = String()
  object_name = String()
  size = Int()
  last_modified = graphene.types.datetime.DateTime()

  presigned_url = String()
  def resolve_presigned_url(parent, info):
    try:
      return minio_client.presigned_get_object(
        parent['bucket_name'],
        parent['object_name'])
    except ResponseError as err:
      print(err)

  size = Field(Int)
  def resolve_size(parent, info):
    try:
      obj = minio_client.stat_object(
        parent['bucket_name'],
        parent['object_name'])
      return obj.size
    except ResponseError as err:
      print(err)

  # @classmethod
  # def resolve_type(cls, instance, info):
  #     return MinioObject