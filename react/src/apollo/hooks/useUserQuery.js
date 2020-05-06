import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useUserQuery(userID) {
  const [user, setUser] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query UserDetails($userID: ID!) {
      user(userID: $userID) {
        userID
        name
        email
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