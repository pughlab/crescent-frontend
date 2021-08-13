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