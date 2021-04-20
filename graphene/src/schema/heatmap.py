from graphene import Float, List, ObjectType, String

class HeatmapData(ObjectType):
    x = List(String)
    @staticmethod
    def resolve_x(parent, info):
        return parent['x']

    y = List(String)
    @staticmethod
    def resolve_y(parent, info):
        return parent['y']

    z = List(List(Float))
    @staticmethod
    def resolve_z(parent, info):
        str_vals = parent['z']
        return [map(float, i) for i in str_vals]
    
    type = String()
    @staticmethod
    def resolve_type(parent, info):
        return parent['type']
        
    hovertemplate = String()
    @staticmethod
    def resolve_hovertemplate(parent, info):
        return parent["hovertemplate"]
