import {useState} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as RA from 'ramda-adjunct'

export default function useSubmitRunMutation(runID) {
  const [submitted, setSubmitted] = useState(true) //start true
  const {loading: loadingRunQuery, data, error, refetch} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        wesID
      }
    }
  `, {
    variables: {
      runID
    },
    fetchPolicy: 'network-only',
    onCompleted: ({run}) => {
      if (!!run) {
        setSubmitted(RA.isNotNil(run.wesID))
      }
    }
  })

  const [submitRun, {loading: loadingSubmitRun}] = useMutation(gql`
    mutation SubmitRun($runID: ID) {
      submitRun(runId: $runID) {
        wesID
      }
    }
  `, {
    client,
    variables: {runID},    
    onCompleted: ({submitRun}) => {
      if (RA.isNotNil(submitRun.wesID))
        setSubmitted(true)
        refetch()
    }
  })

  const loading = loadingRunQuery || loadingSubmitRun
  return {submitRun, loading, submitted}
}