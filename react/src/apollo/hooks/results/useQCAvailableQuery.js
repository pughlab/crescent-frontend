import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'

import * as R from 'ramda'


export default function useQCAvailable({runID, datasetID}) {
  const [availableQc, setAvailableQC] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query QCAvailable($runID: ID, $datasetID: ID) {
      availableQc(runID: $runID, datasetID: $datasetID) {
        key
        text
        value
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({availableQc}) => {
      setAvailableQC(availableQc)
    },
    skip: R.isNil(datasetID)
  })

  return availableQc
}

