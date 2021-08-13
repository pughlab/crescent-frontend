import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { RUN_DETAILS } from '../../queries/run'

export default function useRunDetails(runID) {
  const [run, setRun] = useState(null)
  const {loading, data, error} = useQuery(RUN_DETAILS, {
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })

  return run
}
