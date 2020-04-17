import graphene
from graphene import Schema, Mutation, ObjectType, String, Field, ID, List, Int

from minio import Minio
from minio.error import ResponseError
from minio_client.client import minio_client

import sys
import json
from wes_client import util
from wes_client.util import modify_jsonyaml_paths

class MinioObject(ObjectType):
  # TODO: figure out bidirectional relation between types
  # bucket = Field(MinioBucket)
  
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

class MinioBucket(ObjectType):
  bucket_name = String()

  # Has shape
  #   [{bucket_name, object_name, size, last_modified, etag}]
  objects = List(MinioObject)
  def resolve_objects(parent, info):
    try:
      objects = minio_client.list_objects(parent['bucket_name'])
      # Types matter so map values onto dict

      # Test WES Call
      job = {"message":"Hello World!"}
      job = json.dumps(job)
      # make request to wes
      clientObject = util.WESClient(
          {'auth': '', 'proto': 'http', 'host': "wes-server:8081"})
      req = clientObject.run(
          "/app/src/schema/tool.cwl", job, [])
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
    
    