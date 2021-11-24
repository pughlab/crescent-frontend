const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar RunParameters

  type SecondaryRun {
    wesID: ID
    type: String,
    submittedOn: Date
    completedOn: Date
    status: String
    logs(runID: ID): String
    uploadName: String
  }

  type UploadNames {
    gsva: String
    metadata: String
  }

  type PlotQuery {
    id: ID
    activeResult: String
    selectedQC: String
    selectedFeature: String
    selectedFeatures: [String]
    selectedScaleBy: String
    selectedExpRange: [String]
    selectedGroup: String
    selectedAssay: String
    selectedDiffExpression: String
    selectedQCDataset: ID
    selectedInferCNVType: String
  }

  input PlotQueryInput {
    plotQueryID: ID
    activeResult: String
    selectedQC: String
    selectedFeature: String
    selectedFeatures: [String]
    selectedScaleBy: String
    selectedExpRange: [String]
    selectedGroup: String
    selectedAssay: String
    selectedDiffExpression: String
    selectedQCDataset: ID
    selectedInferCNVType: String
  }

  type Run {
    runID: ID
    createdOn: Date
    createdBy: User
    name: String
    description: String
    parameters: RunParameters
    projectID: ID
    project: Project

    status: String
    downloadable: Boolean
    hasResults: Boolean

    submittedOn: Date
    completedOn: Date

    archived: Date

    secondaryRuns: [SecondaryRun]
    wesID: ID
    logs: String
    failedRunLogs: String
    uploadNames: UploadNames

    # Datasets selected from parent project
    datasets: [Dataset]
    # Datasets selected within a run to act as reference/anchors for CWL
    referenceDatasets: [Dataset] 
    normalCellTypes: [String]

    savedPlotQueries: [PlotQuery]
  }
  type Query {
    allRuns: [Run]
    runs(
      projectID: ID
    ): [Run]
    run(
      runID: ID
    ): Run
    secondaryRun(
      runID: ID,
      wesID: ID
    ): SecondaryRun
  }
  type Mutation {
    createUnsubmittedRun(
      name: String,
      description: String,
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

    cancelSecondaryRun(
      runID: ID,
      wesID: ID
    ): String
    
    # Add metadata to run
    uploadRunMetadata(
      runID: ID!
      metadata: Upload!
    ): Run

    uploadRunGeneset(
      runID: ID!
      geneset: Upload!
    ): Run

    uploadSampleAnnots(
      runID: ID!
      sampleAnnots: Upload!
    ): Run

    uploadGenePos(
      runID: ID!
      genePos: Upload!
    ): Run

    updateNormalCellTypes(
      runID: ID!
      normalCellTypes: [String]
    ): Run

    # Set reference datasets 
    updateRunReferenceDatasets(
      runID: ID!
      datasetIDs: [ID]
    ): Run

    # edit run description
    updateRunDescription(
      runID: ID!
      newDescription: String!
    ): Run

    # edit run name
    updateRunName(
      runID: ID!
      newName: String!
    ): Run
    
    savePlotQuery(
      runID: ID!,
      input: PlotQueryInput!
    ): Run

    updateSavedPlotQuery(
      runID: ID!,
      input: PlotQueryInput!
    ): PlotQuery

    removeSavedPlotQuery(
      runID: ID!,
      plotQueryID: ID!
    ): Run
    
  }
`

module.exports = typeDefs