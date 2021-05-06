import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import {grapheneClient as client} from '../../clients'

export default function useHeatmap(runID) {
  const [heatmap, setHeatmap] = useState(null)
  const { loading, data, error, refetch } = useQuery(gql`
    query Heatmap($runID: ID) {
      heatmap(runID: $runID) {
        type
        x
        y
        z
        hovertemplate
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({ heatmap }) => {
      R.compose(
        setHeatmap,
        R.map(R.evolve({ mode: R.join('+') })),
      )(heatmap)
    },
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

  return {heatmap, loading}
}

