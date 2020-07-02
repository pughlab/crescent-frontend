from graphene import Enum, List, Union

# https://plotly.com/javascript/reference/#violin-hoverinfo
# Any combination of HoverInfoPiece joined by + or a HoverInfoWhole
"""
class HoverInfoPiece(Enum):
    x = "x"
    y = "y"
    z = "z"
    text = "text"
    name = "name"

class HoverInfoWhole(Enum):
    all = "all"
    none = "none"
    skip = "skip"

class HoverInfo(Union):
    class Meta:
        types = (List(HoverInfoPiece), HoverInfoWhole)
"""
class HoverInfo(Enum):
    x = "x"
    y = "y"
    z = "z"
    text = "text"
    name = "name"

    all = "all"
    none = "none"
    skip = "skip"
# """
