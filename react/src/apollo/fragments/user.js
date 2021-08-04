import { gql } from '@apollo/client';

export const CORE_USER_FIELDS = gql`
    fragment CORE_USER_FIELDS on User {
        userID
        email
        name
    }
`