import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useCuratedProjectsQuery() {
  const [curatedProjects, setCuratedProjects] = useState(null)

  const {loading, data, error} = useQuery(gql`
    query {
      curatedProjects {
        projectID
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    onCompleted: ({curatedProjects}) => {
      if (RA.isNotNil(curatedProjects)) {
        setCuratedProjects(curatedProjects)
      }
    }
  })

  return curatedProjects
}