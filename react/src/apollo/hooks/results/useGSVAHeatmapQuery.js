import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import {grapheneClient as client} from '../../clients'
import { useDispatch } from 'react-redux'
import { sendSuccess } from '../../../redux/actions/resultsPage'
import { useService } from '@xstate/react'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'

export default function useGSVAHeatmap(runID, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)

  const { loading, data, error, refetch } = useQuery(gql`
    query GSVAHeatmap($runID: ID) {
      GSVAHeatmap(runID: $runID) {
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
    onCompleted: ({GSVAHeatmap}) => {
      dispatch(sendSuccess({send, data:  R.map(R.evolve({ mode: R.join('+') }), GSVAHeatmap)}))
    },
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])
}

