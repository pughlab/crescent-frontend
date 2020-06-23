from graphene import Scalar
from graphql.language.ast import (
    FloatValue,
    IntValue,
)

MIN_UNIT_INTVL = 0.0
MAX_UNIT_INTVL = 1.0

class UnitInterval(Scalar):
    """
    The 'UnitInterval' scalar type represents a signed double-precision fractional
    values as specified by [IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point).
    that is greater than or equal to 0 and less than or equal to 1
    """
    @staticmethod
    def coerce_unit_int(value):
        try:
            num = float(value)
        except ValueError:
            return None
        if MIN_UNIT_INTVL <= num <= MAX_UNIT_INTVL:
            return num
        return None

    serialize = coerce_unit_int
    parse_value = coerce_unit_int

    @staticmethod
    def parse_literal(node):
        if isinstance(node, (FloatValue, IntValue)):
            num = float(node.value)
            if (MIN_UNIT_INTVL <= num <= MAX_UNIT_INTVL):
                return num
