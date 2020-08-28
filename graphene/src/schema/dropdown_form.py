from graphene import List, ObjectType, String

class DropdownForm(ObjectType):
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
