const mongooseConnection = require('../database/mongo')
const { ApolloServer } = require('apollo-server')

const { mergeTypes, mergeResolvers } = require('merge-graphql-schemas')

const R = require('ramda')

const UserSchema = require('./schema/user')
const ProjectSchema = require('./schema/project')

const schemas = [UserSchema, ProjectSchema]

// GQL server requires type definitions and resolvers for those types
const server = new ApolloServer({
  typeDefs: R.compose(
      mergeTypes,
      R.map(R.prop('typeDefinitions'))
    )(schemas),
  resolvers: R.compose(
    mergeResolvers,
    R.map(R.prop('resolvers'))
  )(schemas),
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