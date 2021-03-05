import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import {grapheneClient as client} from '../../clients'

export default function useDotPlot(features, group, runID, scaleBy, expRange, assay) {
  const [dotPlot, setDotPlot] = useState(null)
  const { loading, data, error, refetch } = useQuery(gql`
    query DotPlot($features: [String], $group: String, $runID: ID, $scaleBy: String, $expRange: [Float], $assay: String) {
      dotPlot(features: $features, group: $group, runID: $runID, scaleBy:$scaleBy, expRange: $expRange, assay: $assay) {
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
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: { features, group, runID, scaleBy, expRange, assay},
    onCompleted: ({ dotPlot }) => {
      R.compose(
        setDotPlot,
        R.map(R.evolve({ mode: R.join('+') })),
      )(dotPlot)
    },
    skip: R.any(R.isNil,[group, assay])
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

  return dotPlot
}

