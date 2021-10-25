import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useUpdateNormalCellTypesMutation(runID) {
  const [run, setRun] = useState(null)
  const [updateNormalCellTypes, {loading}] = useMutation(gql`
    mutation UpdateNormalCellTypes(
      $runID: ID!
      $normalCellTypes: [String]
    ) {
      updateNormalCellTypes(
        runID: $runID
        normalCellTypes: $normalCellTypes
      ) {
        runID
        normalCellTypes
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({updateNormalCellTypes: run}) => {
      if (RA.isNotNil(run)) {
        setRun(run)
      }
    }
  })

  return {run, updateNormalCellTypes, loading}
}