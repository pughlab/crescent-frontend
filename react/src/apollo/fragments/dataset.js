import { gql } from 'apollo-boost'

export const CORE_DATASET_FIELDS = gql`
    fragment CoreDatasetFields on Dataset {
        datasetID
        name
        size
    }
`
export const DATASET_ONTOLOGY_FIELDS = gql`
    fragment DatasetOntologyFields on Dataset {
        cancerTag
        oncotreeCode
        customTags
    }
`
export const DATASET_STATS_FIELDS = gql`
    fragment DatasetStatsFields on Dataset {
        numGenes
        numCells        
    }
`

