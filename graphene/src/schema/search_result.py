from graphene import ObjectType, String

class SearchResult(ObjectType):
    text = String()
    def resolve_text(parent, info):
        return parent['text']
    
    value = String()
    def resolve_value(parent, info):
        return parent['value']
