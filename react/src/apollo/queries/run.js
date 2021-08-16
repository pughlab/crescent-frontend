import { gql } from 'apollo-boost'
import { CORE_RUN_FIELDS, RUN_DATE_FIELDS } from '../fragments/run'
import { SECONDARY_RUN_FIELDS } from '../fragments/secondaryRun'
import { CORE_DATASET_FIELDS, DATASET_ONTOLOGY_FIELDS } from '../fragments/dataset'
import { CORE_USER_FIELDS } from '../fragments/user'

export const RUN_STATUS = gql`
    query RunStatus($runID: ID) {
        run(runID: $runID) {
            status
            logs
        }
    }
  `

export const CANCEL_RUN = gql`
    mutation cancelRun($runID: ID) {
        cancelRun(runID: $runID)
    }
`

export const CREATE_UNSUBMITTED_RUN = gql`
    ${CORE_RUN_FIELDS}
    mutation CreateUnsubmittedRun(
        $name: String!,
        $description: String!,
        $projectID: ID!,
        $userID: ID!
        $datasetIDs: [ID!]!
    ) {
        createUnsubmittedRun(
            name: $name
            description: $description
            datasetIDs: $datasetIDs
            projectID: $projectID
            userID: $userID
        ) {
            ...CoreRunFields
        }
    }
`

export const RUN_DETAILS = gql`
    ${CORE_RUN_FIELDS}
    ${CORE_USER_FIELDS}
    ${RUN_DATE_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    ${SECONDARY_RUN_FIELDS}
    query RunDetails($runID: ID) {
        run(runID: $runID) {
            ...CoreRunFields
            ...RunDateFields
            createdBy {
                ...CoreUserFields
            }
            parameters
            secondaryRuns {
                ...SecondaryRunFields
            }
            uploadNames {
                gsva
                metadata
            }
            datasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
                hasMetadata
            }
            project {
                name
                createdBy {
                    ...CoreUserFields
                }
            }
        }
    }
`

export const EDIT_RUN_DESCRIPTION = gql`
    mutation UpdateRunDescription($runID: ID!, $newDescription: String!) {
        updateRunDescription(runID: $runID, newDescription: $newDescription) {
            description
        }
    }
`

export const EDIT_RUN_NAME = gql`
    mutation UpdateRunName($runID: ID!, $newName: String!) {
        updateRunName(runID: $runID, newName: $newName) {
            name
        }
    }
`

export const RUN_DATASETS = gql`
    ${CORE_DATASET_FIELDS}
    query RunDatasets($runID: ID) {
        run(runID: $runID) {
            parameters
            datasets {
                ...CoreDatasetFields
                hasMetadata
            }
        }
    }
`

export const RUN_LOGS = gql`
    query RunLogs($runID: ID) {
        run(runID: $runID) {
            logs
        }
    }
`

export const RUN_PARAMETERS = gql `
    ${CORE_DATASET_FIELDS}
    query RunParameters($runID: ID) {
        run(runID: $runID) {
            parameters
            datasets {
                ...CoreDatasetFields
            }
        }
    }
`

export const BULK_UPDATE_RUN_PARAMETER_VALUES = gql`
    mutation BulkUpdateRunParameterValues($runID: ID!, $parameters: RunParameters!) {
        bulkUpdateRunParameterValues(runID: $runID, parameters: $parameters) {
            parameters
        }
    }
`

export const SECONDARY_RUN_DETAILS = gql`
    ${SECONDARY_RUN_FIELDS}
    query SecondaryRunDetails($runID: ID) {
        run(runID: $runID) {
            runID
            secondaryRuns {
                ...SecondaryRunFields
            }
        }
    }
`

export const RUN_STATUS_SUBMIT_GSVA = gql`
    ${SECONDARY_RUN_FIELDS}
    query RunStatus($runID: ID) {
        run(runID: $runID) {
            secondaryRuns {
                ...SecondaryRunFields
            }
        }
    }
`

export const SUBMIT_GSVA = gql`
    mutation SubmitGSVA($runID: ID) {
        submitGsva(runId: $runID) {
            wesID
        }
    }
`

export const RUN_STATUS_SUBMIT = gql`
    ${CORE_RUN_FIELDS}
    ${CORE_DATASET_FIELDS}
    query RunStatus($runID: ID) {
        run(runID: $runID) {
            wesID
            ...CoreRunFields
            referenceDatasets {
                ...CoreDatasetFields
            }
        }
    }
`

export const SUBMIT_RUN = gql`
    mutation SubmitRun($runID: ID) {
        submitRun(runId: $runID) {
            wesID
        }
    }
`

export const RUN_PARAMETERS_UPDATE = gql`
    ${CORE_RUN_FIELDS}
    query RunParameters($runID: ID) {
        run(runID: $runID) {
            ...CoreRunFields
            parameters
        }
    }
`
export const UPDATE_RUN_PARAMETER_VALUE = gql`
    ${CORE_RUN_FIELDS}
    mutation UpdateRunParameterValue(
    $runID: ID!
    $step: String!
    $parameter: String!
    $value: ToolParameterValue!
    ) {
        updateRunParameterValue(
            runID: $runID,
            step: $step,
            parameter: $parameter,
            value: $value,
        ) {
            ...CoreRunFields
            parameters
        }
    }
`

export const RUN_REFERENCE_DATASETS = gql`
    ${CORE_RUN_FIELDS}
    ${CORE_DATASET_FIELDS}
    query RunDatasets($runID: ID) {
        run(runID: $runID) {
            ...CoreRunFields
            datasets {
                ...CoreDatasetFields
                hasMetadata
            }
            referenceDatasets {
                ...CoreDatasetFields
            }
        }
    }
`

export const UPDATE_RUN_REFERENCE_DATASETS = gql`
    ${CORE_RUN_FIELDS}
    ${CORE_DATASET_FIELDS}  
    mutation UpdateRunReferenceDatasets(
    $runID: ID!
    $datasetIDs: [ID]
    ) {
    updateRunReferenceDatasets(
        runID: $runID
        datasetIDs: $datasetIDs
    ) {
        ...CoreRunFields
        datasets {
            ...CoreDatasetFields
            hasMetadata
        }
        referenceDatasets {
            ...CoreDatasetFields
        }
    }
    }
`