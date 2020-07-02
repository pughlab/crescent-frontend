from graphene.types import Scalar
from graphql.language.ast import StringValue, IntValue

class Yaxis(Scalar):
    """
    Of the format 'y<integer>' which represents layout.yaxis<integer>
    eg. y2 represents layout.yaxis2
    https://plotly.com/javascript/reference/#violin-yaxis
    """
    @staticmethod
    def coerce_yaxis(val):
        if(val[0] == 'y' or val[0] == 'Y'):
            try:
                int(val[1:])
                return val.lower() # Enforce lower case y
            except ValueError:
                return None
        return None

    # serialize: gets invoked when serializing the result to send it back to a client.
    serialize = coerce_yaxis
    # parseValue: gets invoked to parse client input that was passed through variables.
    parse_value = coerce_yaxis

    @staticmethod
    def parse_literal(node):
        if (isinstance(node, StringValue)):
            val = node.value
            if(val[0] == 'y' or val[0] == 'Y'):
                try:
                    int(val[1:])
                    return val.lower() # Enforce lower case y
                except ValueError:
                    return
        return
