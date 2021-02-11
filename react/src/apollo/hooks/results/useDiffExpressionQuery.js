import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import {grapheneClient as client} from '../../clients'

export default function useDiffExpression(runID) {
  const [diffExpression, setDiffExpression] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query DiffExpression($runID: ID) {
      diffExpression(runID: $runID) {
        key
        text
        value
      }
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({diffExpression}) => {
      setDiffExpression(diffExpression)
    }
  })

  return diffExpression
}

