from graphene import ObjectType, Int, String, Field, ID, List, NonNull, Float, Boolean

from get_data.get_scatter import get_scatter_data
from get_data.get_violin import get_violin_data
from get_data.get_opacity import get_opacity_data
from get_data.get_qc_scatter import get_qc_scatter_data
from get_data.get_qc_violin import get_qc_violin_data
from get_data.get_dot_plot import get_dot_plot_data
from get_data.get_others import (
    get_available_categorical_groups,
    get_available_numeric_groups,
    get_available_qc_data,
    get_cellcount,
    get_diff_expression,
    get_groups,
    get_assays,
    get_plots,
    get_qc_metrics,
    get_top_expressed_data,
    total_size,
    get_GSVA_metrics,
    get_inferCNV_types,
    get_sample_annots_data
)
from get_data.search_features import run_search
from get_data.get_gsva_heatmap import get_GSVA_heatmap_data
from get_data.get_infercnv_heatmap import get_inferCNV_heatmap_data

from schema.dropdown_form import DropdownForm
from schema.gsva_metrics import GSVAMetrics
from schema.heatmap import HeatmapData
from schema.opacity import OpacityData
from schema.plots import Plot
from schema.qc_metrics import QCMetrics
from schema.qc_scatter import QCScatter
from schema.qc_violin import QCViolinData
from schema.scatter import ScatterData
from schema.dot_plot import DotPlotData
from schema.search_result import SearchResult
from schema.top_expressed import TopExpression
from schema.violin import ViolinData

class Query(ObjectType):
    available_qc = List(DropdownForm, runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_available_qc(parent, info, runID, datasetID):
        return get_available_qc_data(runID, datasetID)

    categorical_groups = List(String, runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_categorical_groups(parent, info, runID, datasetID):
        return get_available_categorical_groups(runID, datasetID)
    
    numeric_groups = List(String, runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_numeric_groups(parent, info, runID, datasetID):
        return get_available_numeric_groups(runID, datasetID)
    
    cellcount = Int(runID=ID())
    @staticmethod
    def resolve_cellcount(parent, info, runID):
        return get_cellcount(runID)

    diff_expression = List(DropdownForm, runID=ID())
    @staticmethod
    def resolve_diff_expression(parent, info, runID):
        return get_diff_expression(runID)

    groups = List(String, runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_groups(parent, info, runID, datasetID):
        return get_groups(runID, datasetID)

    assays = List(String, runID=ID())
    @staticmethod
    def resolve_assays(parent, info, runID):
        return get_assays(runID)

    GSVA_metrics = List(GSVAMetrics, runID=ID())
    @staticmethod
    def resolve_GSVA_metrics(parent, info, runID):
        return get_GSVA_metrics(runID)

    GSVA_heatmap = List(NonNull(HeatmapData), runID=ID())
    @staticmethod
    def resolve_GSVA_heatmap(parent, info, runID):
        return get_GSVA_heatmap_data(runID)
    
    inferCNV_heatmap = List(NonNull(HeatmapData), runID=ID(), inferCNVType=String())
    @staticmethod
    def resolve_inferCNV_heatmap(parent, info, runID, inferCNVType):
        return get_inferCNV_heatmap_data(runID, inferCNVType)
    
    inferCNV_types = List(DropdownForm, runID=ID())
    @staticmethod
    def resolve_inferCNV_types(parent, info, runID):
        return get_inferCNV_types(runID)
    
    sample_annots = List(String, runID=ID())
    @staticmethod
    def resolve_sample_annots(parent, info, runID):
        return get_sample_annots_data(runID)

    opacity = List(NonNull(OpacityData), vis=String(), feature=String(), group=String(), runID=ID(), datasetID=ID(), expRange=List(Float), assay=String())
    @staticmethod
    def resolve_opacity(parent, info, vis, feature, group, runID, datasetID, expRange, assay):
        opacity_data = get_opacity_data(feature, group, runID, datasetID, expRange, assay)
        scatter_data = get_scatter_data(vis, group, runID, datasetID)
        length = min(len(opacity_data), len(scatter_data))
        # Now we merge each corresponding object in 
        data = [
            {
                **opacity_data[idx],
                "hovertemplate": '(%{x}, %{y})<br>%{text[0]}<br>Expression value: %{text[1]}', 
                "x": scatter_data[idx]["x"],
                "y": scatter_data[idx]["y"],
                "mode": scatter_data[idx]["mode"],
                "type": scatter_data[idx]["type"]
            } 
            for idx in range(length) if opacity_data[idx]["name"] == scatter_data[idx]["name"]
        ]
        return data

    plots = List(Plot, runID=ID())
    @staticmethod
    def resolve_plots(parent, info, runID):
        return get_plots(runID)

    qc_metrics = Field(QCMetrics, runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_qc_metrics(parent, info, runID, datasetID):
        return get_qc_metrics(runID, datasetID)
    
    qc_scatter = Field(QCScatter, qc_type=String(), runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_qc_scatter(parent, info, qc_type, runID, datasetID):
        return get_qc_scatter_data(qc_type, runID, datasetID)
    
    qc_violin = List(NonNull(QCViolinData), runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_qc_violin(parent, info, runID, datasetID):
        return get_qc_violin_data(runID, datasetID)

    search = List(SearchResult, query=String(), runID=ID(), assay=String())
    @staticmethod
    def resolve_search(parent, info, query, runID, assay):
        return run_search(query, runID, assay)
    
    scatter = List(NonNull(ScatterData), vis=String(), group=String(), runID=ID(), datasetID=ID())
    @staticmethod
    def resolve_scatter(parent, info, vis, group, runID, datasetID):
        return get_scatter_data(vis, group, runID, datasetID)

    dot_plot = List(NonNull(DotPlotData), features=List(String), group=String(), runID=ID(), scaleBy=String(), expRange=List(Float), assay=String(), sidebarCollapsed=Boolean())
    @staticmethod
    def resolve_dot_plot(parent, info, features, group, runID, scaleBy, expRange, assay, sidebarCollapsed):
        return get_dot_plot_data(features, group, runID, scaleBy, expRange, assay, sidebarCollapsed)

    size = Int(runID=ID())
    @staticmethod
    def resolve_size(parent, info, runID):
        return total_size(runID)

    top_expressed = List(TopExpression, runID=ID(), datasetID=ID(), assay=String())
    @staticmethod
    def resolve_top_expressed(parent, info, runID, datasetID, assay):
        return get_top_expressed_data(runID, datasetID, assay)
    
    violin = List(NonNull(ViolinData), feature=String(), group=String(), runID=ID(), datasetID=ID(), assay=String())
    @staticmethod
    def resolve_violin(parent, info, feature, group, runID, datasetID, assay):
        return get_violin_data(feature, group, runID, datasetID, assay)
    