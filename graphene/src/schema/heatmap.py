from graphene import Float, List, ObjectType, String

from schema.secondary.hoverinfo import HoverInfo

class Heatmap(ObjectType):
    x = List(String)
    @staticmethod
    def resolve_x(parent, info):
        return parent['x']

    y = List(String)
    @staticmethod
    def resolve_y(parent, info):
        return parent['y']
    
    text = List(List(Float))
    @staticmethod
    def resolve_text(parent, info):
        str_vals = parent['text']
        return [map(float, i) for i in str_vals]

    hoverinfo = List(HoverInfo)
    @staticmethod
    def resolve_hoverinfo(parent, info):
        return parent['hoverinfo'].split('+')

    z = List(List(Float))
    @staticmethod
    def resolve_z(parent, info):
        str_vals = parent['z']
        return [map(float, i) for i in str_vals]
    
    type = String()
    @staticmethod
    def resolve_type(parent, info):
        return parent['type']
