import { gql } from 'apollo-boost'
import { CORE_RUN_FIELDS, RUN_DATE_FIELDS } from '../fragments/run'
import { SECONDARY_RUN_FIELDS } from '../fragments/secondaryRun'
import { CORE_DATASET_FIELDS, DATASET_ONTOLOGY_FIELDS, DATASET_STATS_FIELDS } from '../fragments/dataset'
import { CORE_USER_FIELDS } from '../fragments/user'
import { CORE_PROJECT_FIELDS } from '../fragments/project'

export const DATASET_DETAILS_CUSTOM_TAG = gql`
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    query DatasetDetails (
        $datasetID: ID!
    ) {
    dataset(
        datasetID: $datasetID
    ) {
        ...CoreDatasetFields
        hasMetadata
        ...DatasetOntologyFields
    }
}  
`
export const ADD_CUSTOM_TAG_DATASET = gql`
    mutation AddCustomTagDataset(
        $datasetID: ID!
        $customTag: String
    ) {
    addCustomTagDataset(
        datasetID: $datasetID
        customTag: $customTag
    ) {
        datasetID
        customTags
    }
    }
`

export const DATASET_DETAILS_QUERY = gql`
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    ${DATASET_STATS_FIELDS}
    query DatasetDetails (
        $datasetID: ID!
    ) {
    dataset(
        datasetID: $datasetID
    ) {
        ...CoreDatasetFields
        hasMetadata
        ...DatasetOntologyFields
        ...DatasetStatsFields
    }
    }
`
export const REMOVE_CUSTOM_TAG_DATASET = gql`
    mutation RemoveCustomTagDataset(
        $datasetID: ID!
        $customTag: String
    ) {
    removeCustomTagDataset(
        datasetID: $datasetID
        customTag: $customTag
    ) {
        datasetID
        customTags
    }
    }
`

export const TAG_DATASET = gql`
    ${CORE_DATASET_FIELDS}
    ${DATASET_ONTOLOGY_FIELDS}
    ${DATASET_STATS_FIELDS}
    mutation TagDataset(
        $datasetID: ID!
        $cancerTag: Boolean
        $oncotreeCode: String
    ) {
    tagDataset(
        datasetID: $datasetID
        cancerTag: $cancerTag
        oncotreeCode: $oncotreeCode
    ) {
        ...CoreDatasetFields
        hasMetadata
        ...DatasetOntologyFields
        ...DatasetStatsFields
    }
    }
`

export const UPLOAD_DATASET_METADATA = gql`
    mutation UploadDatasetMetadata(
        $datasetID: ID!
        $metadata: Upload!
    ) {
    uploadDatasetMetadata(
        datasetID: $datasetID
        metadata: $metadata
    ) {
        datasetID
    }
    }
`

export const DELETE_DATASET = gql`
    mutation DeleteDataset(
        $datasetID: ID!
    ) {
        deleteDataset(
            datasetID: $datasetID
        ) {
            datasetID
        }
    }
`

export const CREATE_DATASET = gql`
    mutation CreateDataset(
        $name: String!
        $matrix: Upload!
        $features: Upload!
        $barcodes: Upload!
    ) {
        createDataset(
            name: $name
            matrix: $matrix
            features: $features
            barcodes: $barcodes
        ) {
            datasetID
        }
    }
`