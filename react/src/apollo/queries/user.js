import { gql } from '@apollo/client';
import { CORE_USER_FIELDS } from '../fragments/user'

export const CREATE_GUEST_USER = gql`
    mutation CreateGuestUser {
      ${CORE_USER_FIELDS}
      createGuestUser {
        ... CORE_USER_FIELDS
      }
    }
  `

export const AUTHENTICATE_USER = gql`
    mutation AuthenticateUser($email: Email!, $password: String!) {
        ${CORE_USER_FIELDS}
        authenticateUser(email: $email, password: $password) {
            ... CORE_USER_FIELDS
            sessionToken
        }
    }
`