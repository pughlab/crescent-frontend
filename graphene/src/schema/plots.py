from graphene import List, ObjectType, String

class Plot(ObjectType):
    label = String()
    @staticmethod
    def resolve_label(parent, info):
        return parent["label"]
    
    result = String()
    @staticmethod
    def resolve_result(parent, info):
        return parent["result"]
    
    description = String()
    @staticmethod
    def resolve_description(parent, info):
        return parent["description"]
