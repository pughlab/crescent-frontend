import { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'

import {grapheneClient as client} from '../../clients'

export default function useDotPlot(features, group, runID, scaleBy, expRange) {
  const [dotPlot, setDotPlot] = useState(null)
  const { loading, data, error } = useQuery(gql`
    query DotPlot($features: [String], $group: String, $runID: ID, $scaleBy: String, $expRange: [Float]) {
      dotPlot(features: $features, group: $group, runID: $runID, scaleBy:$scaleBy, expRange: $expRange) {
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
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: { features, group, runID, scaleBy, expRange },
    onCompleted: ({ dotPlot }) => {
      R.compose(
        setDotPlot,
        R.map(R.evolve({ mode: R.join('+') })),
      )(dotPlot)
    },
    // skip: R.isNil(group)
  })
  return dotPlot
}

