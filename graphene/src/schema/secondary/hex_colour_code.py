from graphene.types import Scalar
from graphql.language.ast import StringValue

import json

class HexColour(Scalar):
    # Should be of the form #RRGGBB where R,G,B are valid hexadecimal digits
    @staticmethod
    def coerce_hex_colour(colour):
        if ((colour[0] == "#") and (len(colour) == 7)):
            # Check if digits are valid hex digits
            try:
                int(colour[1:], 16)
                # Automatically convert lower case leters to upper case for consistency
                return colour.upper()
            except ValueError:
                return None
        else:
            colours = {}
            with open('schema/secondary/colours.json') as colours_file:
                colours = json.load(colours_file)
            if (colour.lower() in colours):
                return colours[colour.lower()].upper()
            return None

    # serialize: gets invoked when serializing the result to send it back to a client.
    serialize = coerce_hex_colour
    # parseValue: gets invoked to parse client input that was passed through variables.
    parse_value = coerce_hex_colour

    # parseLiteral: gets invoked to parse client input that was passed inline in the query.
    @staticmethod
    def parse_literal(node):
        if (isinstance(node, StringValue)):
            colour = node.value
            if ((colour[0] == "#") and (len(colour) == 7)):
                # Check if digits are valid hex digits
                try:
                    int(colour[1:], 16)
                    # Automatically convert lower case leters to upper case for consistency
                    return colour.upper()
                except ValueError:
                    return
            else:
                colours = {}
                with open('schema/secondary/colours.json') as colours_file:
                    colours = json.load(colours_file)
                if (colour.lower() in colours):
                    return colours[colour.lower()].upper()
                return

    @staticmethod
    def hex_to_RGB(hexcode):
        r = int(hexcode[1:3], 16)
        g = int(hexcode[3:5], 16)
        b = int(hexcode[5:7], 16)
        return json.dumps({
            "red": r,
            "green": g,
            "blue": b
        })
    
    @staticmethod
    def RGB_to_hex(r, g, b):
        def reformat(num):
            hexcode = hex(num).upper()
            if (len(hexcode) == 3): # eg. 0xA
                return "0{0}".format(hexcode[-1])
            else: # eg. 0x1A
                return hexcode[-2:] # Last 2 digits
        return "#{0}{1}{2}".format(reformat(r), reformat(g), reformat(b))