from graphene.types import ObjectType, Scalar
from graphql.language.ast import StringValue

from schema.secondary.hex_colour_code import HexColour
from schema.secondary.unitinterval import UnitInterval

class ColorScaleMapping(Scalar):
    @staticmethod
    def coerce_color_scale_mapping(csm):
        ui = UnitInterval.coerce_unit(csm[0])
        colour = HexColour.coerce_hex_colour(csm[1])
        if ( (ui is not None) and (colour is not None) ):
            return [ui, colour]
    
    # serialize: gets invoked when serializing the result to send it back to a client.
    serialize = coerce_color_scale_mapping
    # parseValue: gets invoked to parse client input that was passed through variables.
    parse_value = coerce_color_scale_mapping

    @staticmethod
    def parse_literal(node):
        csm = node.value
        ui = UnitInterval.parse_literal(csm[0])
        colour = HexColour.parse_literal(csm[1])
        return [ui, colour]
