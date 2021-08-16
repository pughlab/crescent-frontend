import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { SECONDARY_RUN_DETAILS } from '../../queries/run'

export default function useSecondaryRunDetails(runID) {
  const [run, setRun] = useState(null)
  const {loading, data, error} = useQuery(SECONDARY_RUN_DETAILS, {
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })

  return run
}
