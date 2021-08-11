import { gql } from 'apollo-boost'
import { CORE_USER_FIELDS } from '../fragments/user'

export const CREATE_GUEST_USER = gql`
    ${CORE_USER_FIELDS}
    mutation CreateGuestUser {
      createGuestUser {
        ...CoreUserFields
      }
    }
  `

export const AUTHENTICATE_USER = gql`
    ${CORE_USER_FIELDS}
    mutation AuthenticateUser($email: Email!, $password: String!) {
        authenticateUser(email: $email, password: $password) {
            ...CoreUserFields
            sessionToken
        }
    }
`