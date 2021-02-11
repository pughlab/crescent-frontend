import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'

export default function useTopExpressed(runID, datasetID) {
  const [topExpressed, setTopExpressed] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query TopExpressed($runID: ID, $datasetID: ID) {
        topExpressed(runID: $runID, datasetID: $datasetID) {
          gene
          cluster
          pVal
          avgLogFc
        }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({topExpressed}) => {
      setTopExpressed(topExpressed)
    }
  })

  return topExpressed
}

