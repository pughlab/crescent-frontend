import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { CORE_USER_FIELDS } from '../../fragments/user';

export default function useUserQuery(userID) {
  const [user, setUser] = useState(null)
  const {loading, data, error} = useQuery(gql`
    ${CORE_USER_FIELDS}
    query UserDetails($userID: ID!) {
      user(userID: $userID) {
        ...CoreUserFields
      }
    }
  `, {
    variables: {userID},
    skip: R.isNil(userID),
    onCompleted: ({user}) => {
      setUser(user)
    }
  })
  return user
}