from graphene import Float, List, ObjectType, String
from schema.secondary.hex_colour_code import HexColour
from schema.secondary.colorscale import ColorScaleMapping

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

    text = List(List(String))
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]

    hovertext = List(List(String))
    @staticmethod
    def resolve_hovertext(parent, info):
        return parent["hovertext"]
    
    colorscale = List(ColorScaleMapping)
    @staticmethod
    def resolve_colorscale(parent, info):
        cs = parent["colorscale"]
        zero_mapping_exists = False
        unit_mapping_exists = False

        for ui, col in cs:
            if (ui == 0):
                zero_mapping_exists = True
            if (ui == 1):
                unit_mapping_exists = True

        if (zero_mapping_exists and unit_mapping_exists):
            return cs
        else:
            return None
