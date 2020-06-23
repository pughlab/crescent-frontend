from graphene import Field, List, ObjectType
"""
Run these if you need to run this file directly
Refer to https://chrisyeh96.github.io/2017/08/08/definitive-guide-python-imports.html#case-2-syspath-could-change
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
"""
from schema.secondary.hex_colour_code import HexColour
from schema.secondary.positivenum import PositiveNumber

class Line(ObjectType):
    color = Field(HexColour)
    @staticmethod
    def resolve_color(parent, info):
        return parent['color']
    
    width = Field(PositiveNumber)
    @staticmethod
    def resolve_width(parent, info):
        return parent['width']
