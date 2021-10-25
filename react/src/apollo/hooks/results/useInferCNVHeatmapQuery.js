import { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'
import { useDispatch } from 'react-redux'
import { sendSuccess } from '../../../redux/actions/resultsPage'
import { useService } from '@xstate/react'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'

export default function useInferCNVHeatmap(runID, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)

  const { error, refetch } = useQuery(gql`
    query InferCNVHeatmap($runID: ID) {
      inferCNVHeatmap(runID: $runID) {
        type
        x
        y
        z
        colorscale
        hovertemplate
        hovertext
        text
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({inferCNVHeatmap}) => {
      dispatch(sendSuccess({send, data: inferCNVHeatmap}))
    },
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])
}