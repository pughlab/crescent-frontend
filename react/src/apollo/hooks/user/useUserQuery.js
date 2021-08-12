import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { CORE_USER_FIELDS } from '../../fragments/user';
import { USER_DETAILS } from '../../queries/user';

export default function useUserQuery(userID) {
  const [user, setUser] = useState(null)
  const {loading, data, error} = useQuery(USER_DETAILS, {
    variables: {userID},
    skip: R.isNil(userID),
    onCompleted: ({user}) => {
      setUser(user)
    }
  })
  return user
}