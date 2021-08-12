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

export const USER_DETAILS = gql`
    ${CORE_USER_FIELDS}
    query UserDetails($userID: ID!) {
      user(userID: $userID) {
        ...CoreUserFields
      }
    }
`
export const CREATE_USER = gql`
    ${CORE_USER_FIELDS}
    mutation CreateUser(
      $firstName: String!,
      $lastName: String!,
      $email: Email!,
      $password: String!
    ) {
      createUser(
        firstName: $firstName,
        lastName: $lastName,
        email: $email,
        password: $password
      ) {
        ...CoreUserFields
      }
    }
`