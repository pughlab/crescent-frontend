import { gql } from 'apollo-boost'
import { CORE_RUN_FIELDS, RUN_DATE_FIELDS, SECONDARY_RUN_FIELDS } from '../fragments/run'

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