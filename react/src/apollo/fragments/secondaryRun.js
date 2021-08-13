import { gql } from 'apollo-boost'

export const SECONDARY_RUN_FIELDS = gql`
    fragment SecondaryRunFields on SecondaryRun {
        wesID
        status
        submittedOn
        completedOn
    }
`