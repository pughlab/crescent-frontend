# Create graphql schema and serve as single endpoint on fastapi server
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.graphql import GraphQLApp
from graphene import Schema
from query import Query
from mutation import Mutation

app = FastAPI()
# TODO: figure out prod
# For CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)
# For Playground
app.add_route("/", GraphQLApp(schema=Schema(query=Query, mutation=Mutation)))
# For Voyager
app.add_route("/graphql", GraphQLApp(schema=Schema(query=Query, mutation=Mutation)))