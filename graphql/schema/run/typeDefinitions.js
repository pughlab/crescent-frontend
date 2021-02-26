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
    hasResults: Boolean

    submittedOn: Date
    completedOn: Date

    wesID: ID
    logs: String

    # Datasets selected from parent project
    datasets: [Dataset]
    # Datasets selected within a run to act as reference/anchors for CWL
    referenceDatasets: [Dataset] 
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

    cancelRun(
      runID: ID
    ): String
    
    # Add metadata to run
    uploadRunMetadata(
      runID: ID!
      metadata: Upload!
    ): Run

    # Set reference datasets 
    updateRunReferenceDatasets(
      runID: ID!
      datasetIDs: [ID]
    ): Run
    
  }
`

module.exports = typeDefs