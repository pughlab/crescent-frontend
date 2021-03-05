import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

export default function useAvailableAssays(runID) {
  const [assays, setAvailableAssays] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Assays($runID: ID) {
      assays(runID: $runID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({assays}) => {
      setAvailableAssays(assays)
    }
  })

  return assays
}

