import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

export default function useSampleAnnots(runID) {
  const [sampleAnnots, setSampleAnnots] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query SampleAnnots($runID: ID) {
      sampleAnnots(runID: $runID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({sampleAnnots}) => {
        setSampleAnnots(sampleAnnots)
    }
  })

  return sampleAnnots
}

