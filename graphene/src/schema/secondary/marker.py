from graphene import Boolean, Int, List, ObjectType
"""
Run these if you need to run this file directly
Refer to https://chrisyeh96.github.io/2017/08/08/definitive-guide-python-imports.html#case-2-syspath-could-change
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
"""
from schema.secondary.colorscale import ColorScaleMapping
from schema.secondary.marker_color import MarkerColor
from schema.secondary.unitinterval import UnitInterval

# Some fields should not return anything if the color array isn't numbers
def isArrayNotNumerical(color_array):
    for color in color_array:
        try:
            int(color)
        except ValueError:
            return True
    return False

class Marker(ObjectType):
    color = List(MarkerColor)
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
    
    opacity = UnitInterval()
    @staticmethod
    def resolve_opacity(parent, info):
        return parent["opacity"]
