import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

export default function useInferCNVTypes(runID) {
  const [types, setTypes] = useState(null)
  const {loading, data, error} = useQuery(gql`
  query InferCNVTypes($runID: ID) {
    inferCNVTypes(runID: $runID) {
      key
      text
      value
    }
  }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({inferCNVTypes}) => {
      setTypes(inferCNVTypes)
    }
  })

  return types
}

