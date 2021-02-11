import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import * as R from 'ramda'


import {grapheneClient as client} from '../../clients'

export default function useCellCounts(runID) {
  const [cellcount, setCellCounts] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query CellCounts($runID: ID) {
      cellcount(runID: $runID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({cellcount}) => {
      setCellCounts(cellcount)
    },
    skip: R.isNil(runID)

  })
  // useEffect(() => {
  //   if (error) {
      
  //   }
  // }, [error])

  return cellcount
}

