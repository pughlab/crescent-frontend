const { gql } = require('apollo-server')

// TYPE DEFINITIONS define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Fairly flexible data types
  scalar Email

  # This defines a node in our data graph
  type User {
    userID: ID
    email: Email
    name: String
  }

  # 'Query' type is main definition for GQL
  # Note: multiple field query run in parallel
  #       multiple field mutation run in sequence
  type Query {
    # The query 'messages' expects array of type 'Message'
    users: [User]!
  }
  # 'Mutation' is similar (but is invoked and not executed immediately)
  type Mutation {
    # 'addUser' will be a function (somewhere) with this signature
    addUser(
      # All fields should be required (i.e. non-null)
      firstName: String!,
      lastName: String!,
      email: String!,
      password: String!
    ): User
  }
`

module.exports = typeDefs