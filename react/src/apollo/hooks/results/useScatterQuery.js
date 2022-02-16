import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'
import { useDispatch } from 'react-redux'
import { useService } from '@xstate/react'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { sendSuccess } from '../../../redux/slices/resultsPage'


export default function useScatter(vis, group, runID, datasetID, selectedFeature, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)
  
  const {loading, data, error, refetch} = useQuery(gql`
    query Scatter($vis: String, $group: String, $runID: ID, $datasetID: ID) {
      scatter(vis: $vis, group: $group, runID: $runID, datasetID: $datasetID) {
        name
        type
        mode
        text
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
    variables: {vis, group, runID, datasetID, selectedFeature},
    onCompleted: ({scatter}) => {
      dispatch(sendSuccess({send, data: R.map(R.evolve({mode: R.join('+')}), scatter), type: "SCATTER_SUCCESS"}))
    },
    skip: R.isNil(group)
  })

}

