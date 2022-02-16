import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import { useService } from '@xstate/react'

import {grapheneClient as client} from '../../clients'

import { useDispatch } from 'react-redux'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { sendSuccess } from '../../../redux/slices/resultsPage'

export default function useDotPlot(features, group, runID, scaleBy, expRange, assay, sidebarCollapsed, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)
  
  const { data, error, refetch } = useQuery(gql`
    query DotPlot($features: [String], $group: String, $runID: ID, $scaleBy: String, $expRange: [Float], $assay: String, $sidebarCollapsed: Boolean) {
      dotPlot(features: $features, group: $group, runID: $runID, scaleBy:$scaleBy, expRange: $expRange, assay: $assay, sidebarCollapsed: $sidebarCollapsed) {
        type
        mode
        x
        y
        hovertemplate
        text
        marker {
            color
            symbol
            size
            opacity
        }
        group
        scaleby
        globalmax
        initialminmax
        dotminmax
        sidebarcollapsed
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: { features, group, runID, scaleBy, expRange, assay, sidebarCollapsed},
    onCompleted: ({ dotPlot }) => {
      dispatch(sendSuccess({ send, data: R.map(R.evolve({ mode: R.join('+') }), dotPlot) }))
    },
    skip: R.any(R.isNil,[group, assay])
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

}

