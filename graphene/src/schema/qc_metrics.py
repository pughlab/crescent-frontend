from graphene import Field, Float, Int, List, ObjectType, String

class CellCounts(ObjectType):
    Before = Int()
    @staticmethod
    def resolve_Before(parent, info):
        return parent["Before"]
    
    After = Int()
    @staticmethod
    def resolve_After(parent, info):
        return parent["After"]

class QC_Step(ObjectType):
    filtertype = String()
    @staticmethod
    def resolve_filtertype(parent, info):
        return parent["filtertype"]

    min = Float()
    @staticmethod
    def resolve_min(parent, info):
        return parent["min"]
    
    max = Float()
    @staticmethod
    def resolve_max(parent, info):
        return parent["max"]

    num_removed = Int()
    @staticmethod
    def resolve_num_removed(parent, info):
        return parent["num_removed"]

class QCMetrics(ObjectType):
    cellcounts = Field(CellCounts)
    @staticmethod
    def resolve_cellcounts(parent, info):
        return parent["cellcounts"]

    qc_steps = List(QC_Step)
    @staticmethod
    def resolve_qc_steps(parent, info):
        return parent["qc_steps"]
