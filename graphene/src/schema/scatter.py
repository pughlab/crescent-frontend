from graphene import Field, Float, ID, List, NonNull, ObjectType, String

from schema.secondary.marker import Marker
from schema.secondary.mode import Mode

class ScatterData(ObjectType):
    name = String()
    @staticmethod
    def resolve_name(parent, info):
        return parent["name"]
    
    mode = List(Mode)
    @staticmethod
    def resolve_mode(parent, info):
        return parent["mode"].split("+")
    
    text = List(NonNull(String))
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]

    x = List(NonNull(Float))
    @staticmethod
    def resolve_x(parent, info):
        return parent["x"]

    y = List(NonNull(Float))
    @staticmethod
    def resolve_y(parent, info):
        return parent["y"]  
    
    marker = Field(Marker)
    @staticmethod
    def resolve_marker(parent, info):
        return parent["marker"]

class Scatter(ObjectType):
    """docstring for Scatter"""
    data = List(NonNull(ScatterData))
    @staticmethod
    def resolve_data(parent, info):
        return parent["data"]
