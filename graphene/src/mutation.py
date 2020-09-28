from graphene import Schema, ObjectType, String, Field, ID

#from schema.create_minio_bucket import CreateMinioBucket
from schema.submit_run import SubmitRun

class Mutation(ObjectType):
    # Mutation type definition and resolver
    # Note using Field method here from object we expect
    submit_run = SubmitRun.Field()


