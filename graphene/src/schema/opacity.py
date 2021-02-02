from graphene import Field, Float, List, NonNull, ObjectType, String, Boolean

from schema.secondary.hex_colour_code import HexColour
from schema.secondary.mode import Mode
from schema.secondary.unitinterval import UnitInterval
from schema.secondary.colorscale import ColorScaleMapping

def isArrayNotNumerical(color_array):
    for color in color_array:
        try:
            int(color)
        except ValueError:
            return True
    return False
    
class OpacityMarker(ObjectType):
    opacity = List(UnitInterval)
    @staticmethod
    def resolve_opacity(parent, info):
        return parent["opacity"]
    
    color = List(HexColour)
    @staticmethod
    def resolve_color(parent, info):
        return parent["color"]
    
    colorscale = List(ColorScaleMapping)
    @staticmethod
    def resolve_colorscale(parent, info):
        if (isArrayNotNumerical(parent["color"])):
            return None
        
        # Plotly states that it needs a mapping for the numbers 0 and 1
        # https://plotly.com/javascript/reference/#scatter-marker-colorscale
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
    
    showscale = Boolean()
    @staticmethod
    def resolve_showscale(parent, info):
        if (isArrayNotNumerical(parent["color"])):
            return None
        return parent["showscale"]

class OpacityData(ObjectType):
    marker = Field(OpacityMarker)
    @staticmethod
    def resolve_marker(parent, info):
        return parent["marker"]

    mode = List(Mode)
    @staticmethod
    def resolve_mode(parent, info):
        return parent["mode"].split("+")
    
    name = String()
    @staticmethod
    def resolve_name(parent, info):
        return parent["name"]
    
    text = List(List(String))
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

    hovertext = List(String)
    @staticmethod
    def resolve_hovertext(parent, info):
        return parent["hovertext"]

    type = String()
    @staticmethod
    def resolve_type(parent, info):
        return parent["type"]

    globalmax = Float()
    @staticmethod
    def resolve_globalmax(parent, info):
        return parent["globalmax"]
    
    hovertemplate = String()
    @staticmethod
    def resolve_hovertemplate(parent, info):
        return parent["hovertemplate"]