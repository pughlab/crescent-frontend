from graphene import Enum

class SpanMode(Enum):
    hard = "hard"
    soft = "soft"
    manual = "manual" # Currently not used by us but an option in plotly
