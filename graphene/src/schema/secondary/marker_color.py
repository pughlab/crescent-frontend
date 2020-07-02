from graphene import Int, Float, Scalar
from graphql.language.ast import FloatValue, IntValue, StringValue

from schema.secondary.hex_colour_code import HexColour

class MarkerColor(Scalar):
    @staticmethod
    def coerce_marker_colour(value):
        if (isinstance(value, str)):
            return HexColour.coerce_hex_colour(value)
        elif (isinstance(value, int) or isinstance(value, float)):
            return value
        return None

    serialize = coerce_marker_colour
    parse_value = coerce_marker_colour

    @staticmethod
    def parse_literal(node):
        if (isinstance(node, StringValue)):
            return HexColour.parse_literal(node)
        elif (isinstance(node, IntValue)):
            return Int.parse_literal(node)
        elif (isinstance(node, FloatValue)):
            return Float.parse_literal(node)
        return
