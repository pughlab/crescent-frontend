import { gql } from 'apollo-boost'
import { CORE_RUN_FIELDS, RUN_DATE_FIELDS } from '../fragments/run'
import { SECONDARY_RUN_FIELDS } from '../fragments/secondaryRun'
import { CORE_DATASET_FIELDS, DATASET_ONTOLOGY_FIELDS } from '../fragments/dataset'
import { CORE_USER_FIELDS } from '../fragments/user'

export const PROJECT_RUNS = gql`
    ${CORE_RUN_FIELDS}
    ${CORE_USER_FIELDS}
    ${RUN_DATE_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query ProjectRuns($projectID: ID) {
        runs(projectID: $projectID) {
            ...CoreRunFields
            ...RunDateFields

            createdBy {
                ...CoreUserFields
            }
            
            parameters
            hasResults

            datasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
                hasMetadata
            }
        }
    }
`