import {useState, useEffect} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {grapheneClient as client} from '../../clients'

export default function useCellCounts(runID) {
  const [cellcount, setCellCounts] = useState(null)
  const {data, startPolling: startCellCountsPolling, stopPolling: stopCellCountsPolling} = useQuery(gql`
    query CellCounts($runID: ID) {
      cellcount(runID: $runID)
    }
    `, {
    client,
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    skip: R.isNil(runID)

  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {cellcount} = data

      setCellCounts(cellcount)
    }
  }, [data])

  return {cellcount, startCellCountsPolling, stopCellCountsPolling}
}

