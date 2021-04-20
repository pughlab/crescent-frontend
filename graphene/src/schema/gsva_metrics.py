from graphene import NonNull, ObjectType, String


class GSVAMetrics(ObjectType):
    cluster = String()
    @staticmethod
    def resolve_cluster(parent, info):
        return parent["cluster"]
    
    celltype = String()
    @staticmethod
    def resolve_celltype(parent, info):
        return parent["celltype"]

    score = String()
    @staticmethod
    def resolve_score(parent, info):
        return parent["score"]
