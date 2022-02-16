import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import { useService } from '@xstate/react'
import { useDispatch } from 'react-redux'
import { useResultsPagePlotQuery } from '../../../redux/hooks/useResultsPage'
import { sendSuccess } from '../../../redux/slices/resultsPage'

export default function useQCViolin({runID, datasetID}, plotQueryIndex) {
  const dispatch = useDispatch()
  const { service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)

  const {loading, data, error} = useQuery(gql`
    query QCViolin($runID: ID, $datasetID: ID) {
      qcViolin(runID: $runID, datasetID: $datasetID) {
        type
        points
        jitter
        text
        hoverinfo
        meanline {
          visible
          color
        }
        x
        y
        marker {
          opacity
        }
        pointpos
        name
        xaxis
        yaxis
        line {
          color
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({qcViolin}) => {
      dispatch(sendSuccess({send, data: qcViolin, type: "VIOLIN_SUCCESS"}))
    }
  })
}

