from graphene import ObjectType, String, Field, ID
from client import minio_client
from minio_bucket import MinioBucket

class Plot(ObjectType):
  plot_type = String()
  @staticmethod
  def resolve_plot_type(parent, info):
    return parent['plot_type']