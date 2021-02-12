import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'


export default function useScatterNumeric(vis, group, runID, datasetID) {
  const [scatter, setScatter] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query Scatter($vis: String, $group: String, $runID: ID, $datasetID: ID) {
      scatter(vis: $vis, group: $group, runID: $runID, datasetID: $datasetID) {
        mode
        text
        # hovertext
        x
        y
        marker {
          color
          colorscale
          showscale
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {vis, group, runID, datasetID},
    onCompleted: ({scatter}) => {
      R.compose(
        setScatter,
        R.map(R.evolve({mode: R.join('+')})),
      )(scatter)
      // setScatterNumeric(scatterNumeric)
    },
    skip: R.isNil(group)
  })

  return scatter
}

