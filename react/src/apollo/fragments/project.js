import { gql } from 'apollo-boost'

export const CORE_PROJECT_FIELDS = gql`
    fragment CoreProjectFields on Project {
        projectID
        name
        description
    }
`