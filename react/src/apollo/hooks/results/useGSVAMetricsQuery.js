import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import {grapheneClient as client} from '../../clients'

export default function useGSVAMetrics(runID) {
  const [metrics, setMetrics] = useState(null)
  const { loading, data, error, refetch } = useQuery(gql`
    query GSVAMetrics($runID: ID) {
      GSVAMetrics(runID: $runID) {
        cluster
        celltype
        score
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({ GSVAMetrics }) => {
     setMetrics(GSVAMetrics)
    },
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

  return metrics
}

