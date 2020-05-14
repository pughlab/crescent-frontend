const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar RunParameters

  type Run {
    runID: ID
    createdOn: Date
    createdBy: User
    name: String
    params: String
    parameters: RunParameters
    projectID: ID
    project: Project
    status: String
    downloadable: Boolean

    submittedOn: Date
    completedOn: Date

    datasets: [Dataset]
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
      userID: ID,
      datasetIDs: [ID]
    ): Run

    updateRunParameterValue(
      runID: ID!
      step: String!,
      parameter: String!,
      value: ToolParameterValue!
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