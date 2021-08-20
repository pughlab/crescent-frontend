import { gql } from 'apollo-boost'
import { CORE_RUN_FIELDS, RUN_DATE_FIELDS } from '../fragments/run'
import { SECONDARY_RUN_FIELDS } from '../fragments/secondaryRun'
import { CORE_DATASET_FIELDS, DATASET_ONTOLOGY_FIELDS } from '../fragments/dataset'
import { CORE_USER_FIELDS } from '../fragments/user'
import { CORE_PROJECT_FIELDS } from '../fragments/project'

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

export const CURATED_PROJECTS_QUERY= gql`
    ${CORE_PROJECT_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query {
        curatedProjects {
            ...CoreProjectFields
            allDatasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
            }
        }
    }
`


export const PROJECT_DETAILS = gql`
    ${CORE_RUN_FIELDS}
    ${CORE_USER_FIELDS}
    ${CORE_PROJECT_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query ProjectDetails($projectID: ID) {
        project(projectID: $projectID) {
            ...CoreProjectFields

            accession
            externalUrls {
                label
                link
                type
            }
            createdOn
            createdBy {
                ...CoreUserFields
            }
            sharedWith {
                ...CoreUserFields
            }
            runs {
                ...CoreRunFields
            }

            mergedProjects {
                ...CoreProjectFields
            }
            uploadedDatasets {
                ...CoreDatasetFields
            }

            allDatasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
                hasMetadata
            }
        }
    }
`

export const UPDATE_PROJECT_DESCRIPTION = gql`
    mutation UpdateProjectDescription($projectID: ID, $newDescription: String) {
        updateProjectDescription(projectID: $projectID, newDescription: $newDescription) {
            description
        }
    }
`

export const UPDATE_PROJECT_NAME = gql`
    mutation UpdateProjectName($projectID: ID, $newName: String) {
        updateProjectName(projectID: $projectID, newName: $newName) {
            name
        }
    }
`

export const CHANGE_PROJECT_OWNERSHIP = gql`
    mutation ChangeProjectOwnership($projectID: ID, $userID: ID) {
        changeProjectOwnership(projectID: $projectID, userID: $userID) {
            createdBy {
                name
            }
        }
    }
`

export const CREATE_MERGED_PROJECT = gql`
    ${CORE_PROJECT_FIELDS}
    mutation CreateMergedProject(
    $userID: ID!,
    $name: String!,
    $description: String!,
    $projectIDs: [ID]!,
    $datasetIDs: [ID]!,
    ) {
    createMergedProject(
        userID: $userID,
        name: $name,
        description: $description,
        projectIDs: $projectIDs,
        datasetIDs: $datasetIDs,
    ) {
        ...CoreProjectFields
    }
    }
`
export const CURATED_PROJECTS = gql`
    ${CORE_USER_FIELDS}
    ${CORE_PROJECT_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query {
        curatedProjects {
            ...CoreProjectFields
            createdOn
            createdBy {
                ...CoreUserFields
            }
            allDatasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
            }
        }
    }
`

export const USER_PROJECTS = gql`
    ${CORE_USER_FIELDS}
    ${CORE_PROJECT_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query UserProjects($userID: ID) {
        projects(userID: $userID) {
            ...CoreProjectFields
            createdOn
            createdBy {
                ...CoreUserFields
            }
            allDatasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
            }
        }
    }
`

export const ARCHIVE_PROJECT = gql`
    mutation ArchiveProject($projectID: ID) {
        archiveProject(projectID: $projectID) {
            projectID
            archived
        }
    }
`

export const PROJECT_USERS = gql`
    ${CORE_USER_FIELDS}
    query ProjectUsers($projectID: ID) {
        project(projectID: $projectID) {
            createdBy {
                ...CoreUserFields
            }
            sharedWith {
                ...CoreUserFields
            }
        }
    }
`

export const UNSHARE_PROJECT_BY_USERID = gql`
    ${CORE_USER_FIELDS}
    ${CORE_PROJECT_FIELDS}
    mutation UnshareProjectByUserID($projectID: ID, $userID: ID) {
        unshareProjectByUserID(projectID: $projectID, userID: $userID) {
            ...CoreProjectFields
            sharedWith {
                ...CoreUserFields
            }
        }
    }
`

export const SHARE_PROJECT_BY_EMAIL = gql`
    mutation ShareProjectByEmail($projectID: ID, $email: Email) {
        shareProjectByEmail(projectID: $projectID, email: $email) {
            projectID
        }
    }
`

export const PROJECT_DATASETS = gql`
    ${CORE_PROJECT_FIELDS}
    ${CORE_DATASET_FIELDS}
    query ProjectDatasets($projectID: ID) {
        project(projectID: $projectID) {
            ...CoreProjectFields

            allDatasets {
                ...CoreDatasetFields
            }
        }
    }
`

export const USER_PROJECTS_QUERY = gql`
    ${CORE_PROJECT_FIELDS}
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query UserProjects($userID: ID) {
        projects(userID: $userID) {
            ...CoreProjectFields

            allDatasets {
                ...CoreDatasetFields
                ...DatasetOntologyFields
            }
        }
    }
`