from graphene import Field, List, NonNull, ObjectType, String

from schema.secondary.hex_colour_code import HexColour
from schema.secondary.unitinterval import UnitInterval

class OpacityMarker(ObjectType):
    opacity = List(UnitInterval)
    @staticmethod
    def resolve_opacity(parent, info):
        return parent["opacity"]
    
    color = List(HexColour)
    @staticmethod
    def resolve_color(parent, info):
        return parent["color"]

class OpacityData(ObjectType):
    name = String()
    @staticmethod
    def resolve_name(parent, info):
        return parent["name"]
    
    text = List(String)
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]
    
    marker = Field(OpacityMarker)
    @staticmethod
    def resolve_marker(parent, info):
        return parent["marker"]

class Opacity(ObjectType):
    data = List(NonNull(OpacityData))
    @staticmethod
    def resolve_data(parent, info):
        return parent["data"]
