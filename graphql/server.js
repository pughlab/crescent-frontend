const mongooseConnection = require('../database/mongo')
const { ApolloServer } = require('apollo-server')


const R = require('ramda')

const UserSchema = require('./schema/user')
const ProjectSchema = require('./schema/project')


// GQL server requires type definitions and resolvers for those types
const server = new ApolloServer({
  typeDefs: R.map(R.prop('typeDefinitions'), [UserSchema, ProjectSchema]),
  resolvers: R.map(R.prop('resolvers'), [UserSchema, ProjectSchema]),
  context: async ({req}) => {
    return {
      // TODO: use DataSource rather than putting connection into context
      // Data models can be provided in context...
      Users: mongooseConnection.model('user'),
      Projects: mongooseConnection.model('project')
    }
  }
})

module.exports = server