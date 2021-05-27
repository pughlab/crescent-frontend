import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import {grapheneClient as client} from '../../clients'

import { useDotPlotMachine } from '../../../components/main/resultsPage/visualizations/DotPlot'

export default function useDotPlot(features, group, runID, scaleBy, expRange, assay, sidebarCollapsed) {
  const [current, send] = useDotPlotMachine();
  const [dotPlot, setDotPlot] = useState(null)
  const { loading, data, error, refetch } = useQuery(gql`
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
      send({type: "SUCCESS", data: R.map(R.evolve({ mode: R.join('+') }), dotPlot)})
    },
    skip: R.any(R.isNil,[group, assay])
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

}

