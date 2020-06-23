from graphene import List, ObjectType, String

class AvailableQCPiece(ObjectType):
    key = String()
    @staticmethod
    def resolve_key(parent, info):
        return parent["key"]
    
    text = String()
    @staticmethod
    def resolve_text(parent, info):
        return parent["text"]
    
    value = String()
    @staticmethod
    def resolve_value(parent, info):
        return parent["value"]

class AvailableQC(ObjectType):
    data = List(AvailableQCPiece)
    @staticmethod
    def resolve_data(parent, info):
        return parent["data"]