import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'


export default function useNumericGroups(runID, datasetID) {
  const [numericGroups, setNumericGroups] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query NumericGroups($runID: ID, $datasetID: ID) {
      numericGroups(runID: $runID, datasetID: $datasetID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({numericGroups}) => {
      setNumericGroups(numericGroups)
    }
  })

  return numericGroups
}

