import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { USER_PROJECTS_QUERY } from '../../queries/project';

export default function useUserProjectsQuery(userID) {
  const [userProjects, setUserProjects] = useState(null)

  const {loading, data, error} = useQuery(USER_PROJECTS_QUERY, {
    fetchPolicy: 'network-only',
    variables: {userID},
    onCompleted: ({projects}) => {
      if (RA.isNotNil(projects)) {
        setUserProjects(projects)
      }
    }
  })


  return userProjects
}