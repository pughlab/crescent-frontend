const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar RunParameters

  type Run {
    runID: ID
    createdOn: Date
    createdBy: User
    name: String
    parameters: RunParameters
    projectID: ID
    project: Project
    status: String
    downloadable: Boolean

    submittedOn: Date
    completedOn: Date

    wesID: ID
    logs: String

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

    bulkUpdateRunParameterValues(
      runID: ID!
      parameters: RunParameters!
    ): Run

    submitRun(
      runID: ID,
    ): Run

    deleteRun(
      runID: ID
    ): Run
  }
`

module.exports = typeDefs