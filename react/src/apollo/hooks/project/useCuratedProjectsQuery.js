import {useState, useEffect} from 'react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { CURATED_PROJECTS_QUERY } from '../../queries/project';

export default function useCuratedProjectsQuery() {
  const [curatedProjects, setCuratedProjects] = useState(null)

  const {loading, data, error} = useQuery(CURATED_PROJECTS_QUERY, {
    fetchPolicy: 'cache-and-network',
    onCompleted: ({curatedProjects}) => {
      if (RA.isNotNil(curatedProjects)) {
        setCuratedProjects(curatedProjects)
      }
    }
  })

  return curatedProjects
}