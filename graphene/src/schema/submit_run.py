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
      # Submit wes run and update using pymongo here
      print(db.runs.find_one())
      return 'wes ID here until we have gql federation'
    except:
      print('submit run error')