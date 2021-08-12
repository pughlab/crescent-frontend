import { gql } from 'apollo-boost'

export const CORE_RUN_FIELDS = gql`
    fragment CoreRunFields on Run {
        runID
        name
        status
        description
    }
`

