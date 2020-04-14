# Create graphql schema and serve as single endpoint on fastapi server
from fastapi import FastAPI
from starlette.graphql import GraphQLApp
from graphene import Schema
from query import Query
from mutation import Mutation

app = FastAPI()
# For Playground
app.add_route("/", GraphQLApp(schema=Schema(query=Query, mutation=Mutation)))
# For Voyager
app.add_route("/graphql", GraphQLApp(schema=Schema(query=Query, mutation=Mutation)))