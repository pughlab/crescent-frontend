from graphene.types import Scalar
from graphql.language.ast import StringValue, IntValue

class Xaxis(Scalar):
    """
    Of the format 'x<integer>' which represents layout.xaxis<integer>
    eg. x2 represents layout.xaxis2
    https://plotly.com/javascript/reference/#violin-xaxis
    """
    @staticmethod
    def coerce_xaxis(val):
        if(val[0] == 'x' or val[0] == 'X'):
            try:
                int(val[1:])
                return val.lower() # Enforce lower case x
            except ValueError:
                return None
        return None

    # serialize: gets invoked when serializing the result to send it back to a client.
    serialize = coerce_xaxis
    # parseValue: gets invoked to parse client input that was passed through variables.
    parse_value = coerce_xaxis

    @staticmethod
    def parse_literal(node):
        if (isinstance(node, StringValue)):
            val = node.value
            if(val[0] == 'x' or val[0] == 'X'):
                try:
                    int(val[1:])
                    return val.lower() # Enforce lower case x
                except ValueError:
                    return
        return
