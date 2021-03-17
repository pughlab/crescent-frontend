import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'

export default function useQCScatter(qcType, runID, datasetID) {
  const [qcScatter, setQCScatter] = useState(null)
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
      R.compose(
        setQCScatter,
        R.evolve({
          mode: R.join('+')
        })
      )(qcScatter)
    }
  })

  return {qcScatter, loading}
}

