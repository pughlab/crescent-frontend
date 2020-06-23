from graphene import Scalar
from graphql.language.ast import (
    FloatValue,
    IntValue,
    StringValue
)

class ScientificNotationNumber(Scalar):
    """
    This is a number of the format '<Mantissa>e<Exponent>' and is equal to ( Mantissa * (10^Exponent) ). 
    Mantissa is a floating point number and exponent is an integer
    """
    @staticmethod
    def coerce_scientific_number(value):
        split = value.split("e")
        mantissa, exponent = split
        if((not len(split) == 2) or (len(mantissa) <= 0) or (len(exponent) <= 0)):
            return None
        try:
            float(mantissa)
        except ValueError:
            return None
        try:
            int(exponent)
        except ValueError:
            return None
        return value.lower() # Enforce a consistent lowercase e
    
    serialize = coerce_scientific_number
    parse_value = coerce_scientific_number

    @staticmethod
    def parse_literal(node):
        if (isinstance(node, StringValue)):
            value = node.value
            split = value.split("e")
            mantissa = split[0]
            exponent = split[1]
            if((not len(split) == 2) or (len(mantissa) <= 0) or (len(exponent) <= 0)):
                return None
            try:
                float(mantissa)
            except ValueError:
                return None
            try:
                int(exponent)
            except ValueError:
                return None
            return value.lower() # Enforce a consistent lowercase e
