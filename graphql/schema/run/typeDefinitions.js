const { gql } = require('apollo-server')

const typeDefs = gql`
  type Run {
    runID: ID
    createdOn: Date
    createdBy: User
    name: String
    params: String
    projectID: ID
    project: Project
    status: String
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
    createUnsubmittedRun(
      name: String,
      projectID: ID,
      userID: ID
    ): Run

    submitRun(
      runID: ID,
      params: String
    ): Run

    deleteRun(
      runID: ID
    ): Run
  }
`

module.exports = typeDefs