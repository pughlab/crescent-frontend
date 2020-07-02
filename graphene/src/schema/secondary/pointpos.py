from graphene import Scalar
from graphql.language.ast import (
    FloatValue,
    IntValue,
)

MIN_POINTPOS = -2.0
MAX_POINTPOS = 2.0

class PointPos(Scalar):
    """
    The 'UnitInterval' scalar type represents a signed double-precision fractional
    values as specified by [IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point).
    that is greater than or equal to 0 and less than or equal to 1
    """
    @staticmethod
    def coerce_pointpos(value):
        try:
            num = float(value)
        except ValueError:
            return None
        if MIN_POINTPOS <= num <= MAX_POINTPOS:
            return num
        return None

    serialize = coerce_pointpos
    parse_value = coerce_pointpos

    @staticmethod
    def parse_literal(node):
        if isinstance(node, (FloatValue, IntValue)):
            num = float(node.value)
            if (MIN_POINTPOS <= num <= MAX_POINTPOS):
                return num
