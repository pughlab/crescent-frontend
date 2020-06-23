# Create graphql schema and serve as single endpoint on fastapi server
from fastapi import FastAPI
from starlette.graphql import GraphQLApp
from fastapi.middleware.cors import CORSMiddleware
from graphene import Schema
from query import Query

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)
# For Playground
app.add_route("/", GraphQLApp(schema=Schema(query=Query)))