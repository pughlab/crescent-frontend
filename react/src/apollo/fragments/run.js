import { gql } from 'apollo-boost'

export const CORE_RUN_FIELDS = gql`
    fragment CoreRunFields on Run {
        runID
        name
        status
        description
    }
`
export const RUN_DATE_FIELDS = gql`
    fragment RunDateFields on Run {
        createdOn
        submittedOn
        completedOn
    }
`


