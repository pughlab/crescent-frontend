from graphene import ObjectType, String, Field, Int, List
import os
import loompy
from minio_client.client import minio_client
from minio.error import ResponseError


from ..interfaces.minio_object_interface import MinioObjectInterface

# TODO: once uvicorn is dockerized, use env for path to object store
def minio_object_path(loom_file_parent):
  bucket_name = loom_file_parent['bucket_name']
  object_name = loom_file_parent['object_name']
  return '../minio/'+bucket_name+'/'+object_name

# See http://linnarssonlab.org/loompy/fullapi/loompy.html#loomconnection-class
class LoomFile(ObjectType):
  class Meta:
    interfaces = (MinioObjectInterface, )


  column_attributes = Field(List(String))
  def resolve_column_attributes(parent, info):
    with loompy.connect(minio_object_path(parent)) as ds:
      return ds.ca.keys()

  row_attributes = Field(List(String))
  def resolve_row_attributes(parent, info):
    with loompy.connect(minio_object_path(parent)) as ds:
      return ds.ra.keys()
    
  shape = Field(List(Int))
  def resolve_shape(parent, info):
    with loompy.connect(minio_object_path(parent)) as ds:
      return ds.shape