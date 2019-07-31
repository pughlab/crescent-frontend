const mongooseConnection = require('../database/mongo')
const { ApolloServer } = require('apollo-server')

const UserSchema = require('./schema/user')

// GQL server requires type definitions and resolvers for those types
const server = new ApolloServer({
  typeDefs: UserSchema.typeDefinitions,
  resolvers: UserSchema.resolvers,
  context: async ({req}) => {
    return {
      // TODO: use DataSource rather than putting connection into context
      // Data models can be provided in context...
      Users: mongooseConnection.model('user'),
    }
  }
})

module.exports = server