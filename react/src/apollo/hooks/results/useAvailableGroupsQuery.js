import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

export default function useAvailableGroups(runID, datasetID) {
  const [groups, setAvailableGroups] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Groups($runID: ID, $datasetID: ID) {
      groups(runID: $runID, datasetID: $datasetID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({groups}) => {
      setAvailableGroups(groups)
    }
  })

  return groups
}

