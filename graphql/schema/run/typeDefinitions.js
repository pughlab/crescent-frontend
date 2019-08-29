const { gql } = require('apollo-server')

const typeDefs = gql`
  type Run {
    runID: ID
    name: String
    params: String
  }
  type Query {
    runs(
      projectID: ID
    ): [Run]
    run(
      runID: ID
    ): Run
  }
  type Mutation {
    createRun(
      name: String,
      params: String,
      projectID: ID
    ): Run
  }
`

module.exports = typeDefs