const { gql } = require('apollo-server')

// TYPE DEFINITIONS define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Fairly flexible data types
  scalar Email

  type KeycloakUser {
    keycloakUserID: ID!
    name: String!
    email: Email!
    userID: ID!
  }

  # This defines a node in our data graph
  type User {
    userID: ID
    email: Email
    name: String
    # sessionToken: ID
    projects: [Project]
  }

  # 'Query' type is main definition for GQL
  # Note: multiple field query run in parallel
  #       multiple field mutation run in sequence
  type Query {
    # The query 'messages' expects array of type 'Message'
    users: [User]! @hasRole(role: "developer")
    user(userID: ID!): User!
  }
  # 'Mutation' is similar (but is invoked and not executed immediately)
  type Mutation {
    """
    Checks in (creates if does not exist) keycloak user to neo4j based on token after authentication
    """
    me: KeycloakUser

    createGuestUser: User

    authenticateUser(
      email: Email!,
      password: String!
    ): User

    # 'addUser' will be a function (somewhere) with this signature
    createUser(
      # All fields should be required (i.e. non-null)
      firstName: String!,
      lastName: String!,
      email: Email!,
      password: String!
    ): User
  }
`

module.exports = typeDefs