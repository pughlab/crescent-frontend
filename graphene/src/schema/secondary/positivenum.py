from graphene import Scalar
from graphql.language.ast import (
    FloatValue,
    IntValue,
)

class PositiveNumber(Scalar):
    """
    The 'PositiveNumber' scalar type represents a signed double-precision fractional
    values as specified by [IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point).
    that is greater than or equal to 0
    """
    @staticmethod
    def coerce_positive_num(value):
        try:
            num = float(value)
        except ValueError:
            return None
        if num >= 0:
            return num
        return None

    serialize = coerce_positive_num
    parse_value = coerce_positive_num

    @staticmethod
    def parse_literal(node):
        if isinstance(node, (FloatValue, IntValue)):
            num = float(node.value)
            if (num >= 0):
                return num
