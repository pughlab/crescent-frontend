from graphene import Enum, List, Union

# https://plotly.com/javascript/reference/#violin-hoverinfo
class HoverInfo(Enum):
    # Any combination of these joined by +
    x = "x"
    y = "y"
    z = "z"
    text = "text"
    name = "name"
    
    # Or one of these
    all = "all"
    none = "none"
    skip = "skip"
