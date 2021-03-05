import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'

export default function useTopExpressed(runID, datasetID, assay) {
  const [topExpressed, setTopExpressed] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query TopExpressed($runID: ID, $datasetID: ID, $assay: String) {
        topExpressed(runID: $runID, datasetID: $datasetID, assay: $assay) {
          gene
          cluster
          pVal
          avgLogFc
        }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID, assay},
    onCompleted: ({topExpressed}) => {
      setTopExpressed(topExpressed)
    },
    skip: R.isNil(assay)
  })

  return topExpressed
}

