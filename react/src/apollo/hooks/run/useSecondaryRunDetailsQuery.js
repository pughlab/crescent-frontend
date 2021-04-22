import {useState} from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

export default function useSecondaryRunDetails(runID) {
  const [run, setRun] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query SecondaryRunDetails($runID: ID) {
      run(runID: $runID) {
        runID
        secondaryRuns {
          wesID
          status
          submittedOn
          completedOn
        }
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {runID},
    onCompleted: ({run}) => {
      setRun(run)
    }
  })

  return run
}
