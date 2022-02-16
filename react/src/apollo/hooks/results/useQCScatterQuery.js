import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'
import { useDispatch } from 'react-redux'
import { useService } from '@xstate/react'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { sendSuccess } from '../../../redux/slices/resultsPage'

export default function useQCScatter(qcType, runID, datasetID, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)

  const {loading, data, error} = useQuery(gql`
    query QCScatter($qcType: String, $runID: ID, $datasetID: ID) {
      qcScatter(qcType: $qcType, runID: $runID, datasetID: $datasetID) {
        mode
        text
        hovertext
        x
        y
        marker {
          color
          colorscale
          showscale
        }
        type
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {qcType, runID, datasetID},
    onCompleted: ({qcScatter}) => {
      dispatch(sendSuccess({send, data: [R.evolve({mode: R.join('+')}, qcScatter)], type: "UMAP_SUCCESS"}))
    }
  })
}

