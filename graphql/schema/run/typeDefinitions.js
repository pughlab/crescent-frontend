const { gql } = require('apollo-server')

const typeDefs = gql`
  type Run {
    runID: ID
    name: String
    params: String
  }
  type Query {
    run(
      runID: ID
    ): Run
  }
  type Mutation {
    createRun(
      name: String,
      params: String
    ): Run
  }
`

module.exports = typeDefs