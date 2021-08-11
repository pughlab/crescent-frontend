import { gql } from 'apollo-boost'

export const CORE_USER_FIELDS = gql`
    fragment CoreUserFields on User {
        userID
        email
        name
    }
`