const { gql } = require('apollo-server')

const typeDefs = gql`
  type Run {
    runID: ID
    name: String
    params: String
    projectID: ID
    project: Project
  }
  type Query {
    allRuns: [Run]
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