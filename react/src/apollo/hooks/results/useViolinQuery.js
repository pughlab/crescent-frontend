import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'


export default function useViolin(feature, group, runID, datasetID) {
  const [violin, setViolin] = useState(null)
  const {loading, data, error, refetch} = useQuery(gql`
    query Violin($feature: String, $group: String, $runID: ID, $datasetID: ID) {
      violin(feature: $feature, group: $group, runID: $runID, datasetID: $datasetID) {
        name
        type
        spanmode
        fillcolor
        line {
          color
        }
        points
        jitter
        width
        meanline {
          visible
        }
        x
        y
        bandwidth
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {feature, group, runID, datasetID},
    onCompleted: ({violin}) => {
      setViolin(violin)
    },
    skip: R.isNil(feature, group)
  })

  useEffect(() => {
    if (error) {
      refetch()
    }
  }, [error])

  return violin
}

