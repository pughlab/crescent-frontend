from graphene import ObjectType, String, Field, ID, List
from client import minio_client
from minio_bucket import MinioBucket
from plot import Plot
# Define your queries and their resolvers here
class Query(ObjectType):
  # A type definition and resolver for each field
  bucket = Field(MinioBucket, bucket_name=String(required=True))
  @staticmethod
  def resolve_bucket(parent, info, bucket_name):
    if minio_client.bucket_exists(bucket_name):
      return {'bucket_name': bucket_name}
    else:
      return None

  plots = Field(List(Plot))
  @staticmethod
  def resolve_plots(parent, info):
    return [
      # snack_case python, camelCase graphql
      {'plot_type': 'doubleViolin'},
      {'plot_type': 'scatter'},
      {'plot_type': 'violin'}
    ]