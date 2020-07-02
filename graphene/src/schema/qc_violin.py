from graphene import Field, Float, List, NonNull, ObjectType, String

from schema.secondary.hoverinfo import HoverInfo
from schema.secondary.line import Line
from schema.secondary.marker import Marker
from schema.secondary.meanline import Meanline
from schema.secondary.pointpos import PointPos
from schema.secondary.points import Points
from schema.secondary.unitinterval import UnitInterval
from schema.secondary.xaxis import Xaxis
from schema.secondary.yaxis import Yaxis

class QCViolinData(ObjectType):
    type = String()
    @staticmethod
    def resolve_type(parent, info):
        return "violin"
    
    points = Field(Points)
    @staticmethod
    def resolve_points(parent, info):
        return parent["points"]

    jitter = UnitInterval()
    @staticmethod
    def resolve_jitter(parent, info):
        return parent["jitter"]
    
    text = List(String)
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]
    
    hoverinfo = List(HoverInfo)
    @staticmethod
    def resolve_hoverinfo(parent, info):
        return parent["hoverinfo"].split('+')

    text = List(NonNull(String))
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]

    meanline = Field(Meanline)
    @staticmethod
    def resolve_meanline(parent, info):
        return parent["meanline"]
    
    x = List(NonNull(String))
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
    
    pointpos = PointPos()
    @staticmethod
    def resolve_pointpos(parent, info):
        return parent["pointpos"]

    name = String()
    @staticmethod
    def resolve_name(parent, info):
        return parent["name"]
    
    xaxis = Xaxis()
    @staticmethod
    def resolve_xaxis(parent, info):
        return parent["xaxis"]

    yaxis = Yaxis()
    @staticmethod
    def resolve_yaxis(parent, info):
        return parent["yaxis"]
    
    line = Field(Line)
    @staticmethod
    def resolve_line(parent, info):
        return parent["line"]

class QCViolin(ObjectType):
    data = List(NonNull(QCViolinData))
    @staticmethod
    def resolve_data(parent, info):
        return parent["data"]
