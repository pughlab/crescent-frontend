from graphene import Enum

# https://plotly.com/javascript/reference/#violin-points
class Points(Enum):

    all = "all"

    outliers = "outliers"
    
    suspectedoutliers = "suspectedoutliers"

    false = False 
