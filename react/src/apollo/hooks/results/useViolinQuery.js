import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useService } from '@xstate/react'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { sendSuccess } from '../../../redux/slices/resultsPage'

export default function useViolin(feature, group, runID, datasetID, assay, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)
  
  const {loading, data, error, refetch} = useQuery(gql`
    query Violin($feature: String, $group: String, $runID: ID, $datasetID: ID, $assay: String) {
      violin(feature: $feature, group: $group, runID: $runID, datasetID: $datasetID, assay: $assay) {
        name
        type
        spanmode
        fillcolor
        line {
          color
        }
        points
        jitter
        width
        meanline {
          visible
        }
        x
        y
        bandwidth
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {feature, group, runID, datasetID, assay},
    onCompleted: ({violin}) => {
      dispatch(sendSuccess({send, data: violin}))
    },
    skip: R.any(R.isNil, [feature, group, assay])
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])
}

