from graphene import ObjectType, Int, String, Field, ID, List

from get_data.get_scatter import get_scatter_data
from get_data.get_violin import get_violin_data
from get_data.get_opacity import get_opacity_data
from get_data.get_qc_scatter import get_qc_scatter_data
from get_data.get_qc_violin import get_qc_violin_data
from get_data.get_others import (
    get_available_categorical_groups,
    get_available_qc_data,
    get_cellcount,
    get_groups,
    get_plots,
    get_qc_metrics,
    get_top_expressed_data,
)

from schema.available_qc import AvailableQC
from schema.opacity import Opacity
from schema.plots import Plot
from schema.qc_metrics import QCMetrics
from schema.qc_scatter import QCScatter
from schema.qc_violin import QCViolin
from schema.scatter import Scatter
from schema.top_expressed import TopExpressed
from schema.violin import Violin

class Query(ObjectType):
    scatter = Field(Scatter, vis=String(), group=String(), runID=ID())
    @staticmethod
    def resolve_scatter(parent, info, vis, group, runID):
        return {"data": get_scatter_data(vis, group, runID)}
    
    violin = Field(Violin, feature=String(), group=String(), runID=ID())
    @staticmethod
    def resolve_violin(parent, info, feature, group, runID):
        return {"data": get_violin_data(feature, group, runID,)}
    
    opacity = Field(Opacity, feature=String(), group=String(), runID=ID())
    @staticmethod
    def resolve_opacity(parent, info, feature, group, runID):
        return {"data": get_opacity_data(feature, group, runID)}

    top_expressed = Field(TopExpressed, runID=ID())
    @staticmethod
    def resolve_top_expressed(parent, info, runID):
        return {"data": get_top_expressed_data(runID)}
    
    available_qc = Field(AvailableQC, runID=ID())
    @staticmethod
    def resolve_available_qc(parent, info, runID):
        return {"data": get_available_qc_data(runID)}
    
    groups = List(String, runID=ID())
    @staticmethod
    def resolve_groups(parent, info, runID):
        return get_groups(runID)
    
    cellcount = Int(runID=ID())
    @staticmethod
    def resolve_cellcount(parent, info, runID):
        return get_cellcount(runID)
    
    plots = List(Plot, runID=ID())
    @staticmethod
    def resolve_plots(parent, info, runID):
        return get_plots(runID)
    
    qc_metrics = Field(QCMetrics, runID=ID())
    @staticmethod
    def resolve_qc_metrics(parent, info, runID):
        return get_qc_metrics(runID)
    
    categorical_groups = List(String, runID=ID())
    @staticmethod
    def resolve_categorical_groups(parent, info, runID):
        return get_available_categorical_groups(runID)["groups"]
    
    qc_scatter = Field(QCScatter, qc_type=String(), runID=ID())
    @staticmethod
    def resolve_qc_scatter(parent, info, qc_type, runID):
        return get_qc_scatter_data(qc_type, runID)
    
    qc_violin = Field(QCViolin, runID=ID())
    @staticmethod
    def resolve_qc_violin(parent, info, runID):
        return {"data": get_qc_violin_data(runID)}
    