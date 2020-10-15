from graphene import Field, Float, ID, List, NonNull, ObjectType, String

from schema.secondary.marker import Marker
from schema.secondary.mode import Mode

class DotPlotData(ObjectType):
    
    mode = List(Mode)
    @staticmethod
    def resolve_mode(parent, info):
        return parent["mode"].split("+")
    
    x = List(NonNull(String))
    @staticmethod
    def resolve_x(parent, info):
        return parent["x"]

    y = List(NonNull(String))
    @staticmethod
    def resolve_y(parent, info):
        return parent["y"]  
    
    marker = Field(Marker)
    @staticmethod
    def resolve_marker(parent, info):
        return parent["marker"]

    # hovertext = List(String)
    # @staticmethod
    # def resolve_hovertext(parent, info):
    #     return parent["hovertext"]
    
    type = String()
    @staticmethod
    def resolve_type(parent, info):
        return parent["type"]
