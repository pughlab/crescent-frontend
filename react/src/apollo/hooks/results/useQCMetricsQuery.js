import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'


export default function useQCMetrics({runID, datasetID}) {
  const [qcMetrics, setQCMetrics] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query QCMetrics($runID: ID, $datasetID: ID) {
      qcMetrics(runID: $runID, datasetID: $datasetID) {
        cellcounts {
          Before
          After
        }
        qcSteps {
          filtertype
          min
          max
          numRemoved
        }
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID, datasetID},
    onCompleted: ({qcMetrics}) => {
      setQCMetrics(qcMetrics)
    },
    skip: R.isNil(datasetID)
  })

  console.log(qcMetrics)
  return qcMetrics
}

