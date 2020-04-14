import graphene
from graphene import Union, ObjectType, String, Field, ID, List, Int

from minio import Minio
from minio.error import ResponseError
from minio_client.client import minio_client

from .minio_object import MinioObject
from .loom_file import LoomFile

class BucketObject(Union):
  class Meta:
      types = (MinioObject, LoomFile)

class MinioBucket(ObjectType):
  bucket_name = String()

  # Has shape
  #   [{bucket_name, object_name, size, last_modified, etag}]
  objects = List(BucketObject)
  def resolve_objects(parent, info):
    try:
      objects = minio_client.list_objects(parent['bucket_name'])
      # Types matter so map values onto dict
      return map(
        lambda obj: {
          'bucket_name': obj.bucket_name,
          'object_name': obj.object_name,
          'size': obj.size,
          'last_modified': obj.last_modified
        },
        objects)
    except ResponseError as err:
      print(err)
    
    