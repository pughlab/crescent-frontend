import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'

export default function useQCViolin({runID, datasetID}) {
  const [qcViolin, setQCViolin] = useState(null)
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
      setQCViolin(qcViolin)
    }
  })

  return qcViolin
}

