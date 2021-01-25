from graphene import Field, Float, ID, List, NonNull, ObjectType, String

from schema.secondary.dot_plot_marker import DotPlotMarker
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
    
    marker = Field(DotPlotMarker)
    @staticmethod
    def resolve_marker(parent, info):
        return parent["marker"]

    hovertemplate = String()
    @staticmethod
    def resolve_hovertemplate(parent, info):
        return parent["hovertemplate"]
    
    text = List(List(String))
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]
    
    type = String()
    @staticmethod
    def resolve_type(parent, info):
        return parent["type"]

    group = String()
    @staticmethod
    def resolve_group(parent, info):
        return parent["group"]
    
    scaleby = String()
    @staticmethod
    def resolve_scaleBy(parent, info):
        return parent["scaleby"]
    
    globalmax = Float()
    @staticmethod
    def resolve_globalmax(parent, info):
        return parent["globalmax"]