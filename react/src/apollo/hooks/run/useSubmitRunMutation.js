import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useSubmitRunMutation(runID) {
  // const run = useRunDetailsQuery(runID)

  const [runStatus, setRunStatus] = useState(null)
  const {loading, data, error} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        status
      }
    }
  `, {
    variables: {
      runID
    },
    onCompleted: ({run: {status}}) => {
      setRunStatus(status)
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
    onCompleted: ({submitRun: {wesID}}) => {
      if (wesID != null)
        setRunStatus('submitted')
    }
  })

  return {submitRun, runStatus, loadingSubmitRun}
}