from graphene import Schema, Mutation, String, Field, ID, List

from pymongo import MongoClient
from os import environ
mongo_client = MongoClient(environ.get('MONGO_URL'))
db = mongo_client['crescent']

class SubmitRun(Mutation):
  # Subclass for describing what arguments mutation takes
  class Arguments:
    run_id = ID()
    # WES ID
  Output = ID
  # Resolver function with arguments
  def mutate(root, info, run_id):
    try:
      print('some run')
      print(db.runs.find_one())
      return 'awdaw'
    except:
      print('submit run error')