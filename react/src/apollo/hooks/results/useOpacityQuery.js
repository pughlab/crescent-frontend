import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import {grapheneClient as client} from '../../clients'
import { useDispatch } from 'react-redux'
import { useService } from '@xstate/react'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { sendSuccess } from '../../../redux/slices/resultsPage'

export default function useOpacity(vis, feature, group, runID, datasetID, expRange, assay, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)
  
  const {loading, data, error, refetch} = useQuery(gql`
    query Opacity($vis: String, $feature: String, $group: String, $runID: ID, $datasetID: ID, $expRange: [Float], $assay: String) {
      opacity(vis: $vis, feature: $feature, group: $group, runID: $runID, datasetID: $datasetID, expRange: $expRange, assay: $assay) {
        name
        type
        mode
        text
        x
        y
        marker {
            opacity
            color
        }
        hovertemplate
        globalmax
        initialminmax
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {vis, feature, group, runID, datasetID, expRange, assay},
    onCompleted: ({opacity}) => {
      dispatch(sendSuccess({send, data: R.map(R.evolve({mode: R.join('+')}), opacity), type: "OPACITY_SUCCESS"}))
    },
    skip: R.any(R.isNil, [feature, group, assay])
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])
}

