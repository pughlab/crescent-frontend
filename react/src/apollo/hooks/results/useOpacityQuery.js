import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import {grapheneClient as client} from '../../clients'

export default function useOpacity(vis, feature, group, runID, datasetID, expRange) {
  const [opacity, setOpacity] = useState(null)
  const {loading, data, error, refetch} = useQuery(gql`
    query Opacity($vis: String, $feature: String, $group: String, $runID: ID, $datasetID: ID, $expRange: [Float]) {
      opacity(vis: $vis, feature: $feature, group: $group, runID: $runID, datasetID: $datasetID, expRange: $expRange) {
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
    variables: {vis, feature, group, runID, datasetID, expRange},
    onCompleted: ({opacity}) => {
      R.compose(
        setOpacity,
        R.map(R.evolve({mode: R.join('+')})),
        // R.prop('data')
      )(opacity)
    },
    skip: R.isNil(feature, group)
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

  return opacity
}

