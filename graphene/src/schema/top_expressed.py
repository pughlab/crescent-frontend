from graphene import Int, Float, List, ObjectType, String

from schema.secondary.scientific_notation_num import ScientificNotationNumber

class TopExpression(ObjectType):
    gene = String()
    @staticmethod
    def resolve_gene(parent, info):
        return parent["gene"]
    
    cluster = Int()
    @staticmethod
    def resolve_cluster(parent, info):
        return parent["cluster"]
    
    p_val = ScientificNotationNumber()
    @staticmethod
    def resolve_p_val(parent, info):
        return parent["p_val"]
    
    avg_log_fc = Float()
    @staticmethod
    def resolve_avg_log_fc(parent, info):
        return parent["avg_logFC"]
