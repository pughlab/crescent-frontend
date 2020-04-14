import graphene
from graphene import ObjectType, String, Field, ID, List, Int

from minio import Minio
from minio.error import ResponseError
from minio_client.client import minio_client

# from .minio_object_interface import MinioObjectInterface

from ..interfaces import MinioObjectInterface 

class MinioObject(ObjectType):
  class Meta:
    interfaces = (MinioObjectInterface, )
  # TODO: figure out bidirectional relation between types
  # bucket = Field(MinioBucket)
