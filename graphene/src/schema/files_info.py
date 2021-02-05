from graphene import List, ObjectType, String

class FilesInfo(ObjectType):
    existingFiles = List(String)
    @staticmethod
    def resolve_existingFiles(parent, info):
        print(parent)
        return parent["existingFiles"]
    
    missingFiles = List(String)
    @staticmethod
    def resolve_missingFiles(parent, info):
        print(parent)
        return parent["missingFiles"]
    
