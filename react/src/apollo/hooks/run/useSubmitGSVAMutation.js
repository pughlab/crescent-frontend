import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useSubmitGSVAMutation(runID) {
  // const run = useRunDetailsQuery(runID)

  const [run, setRun] = useState(null)
  const [submitted, setSubmitted] = useState(true) //start true
  const {loading: loadingRunQuery, data, error, refetch: refetchRunStatus} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        secondaryRuns {
          wesID
          status
          submittedOn
          completedOn
        }
      }
    }
  `, {
    variables: {
      runID
    },
    fetchPolicy: 'network-only',
    onCompleted: ({run}) => {
      if (!!run) {
        setRun(run)
        setSubmitted(RA.isNotNil(run.secondaryRuns.wesID))
      }
    }
  })

  useEffect(() => {
    if (data) {
      setRun(data.run)
    }
  }, [data])

  const [submitGsva, {loading: loadingSubmitGSVA, data: gsvaData}] = useMutation(gql`
    mutation SubmitGSVA($runID: ID) {
      submitGsva(runId: $runID) {
        wesID
      }
    }
  `, {
    client,
    variables: {runID},    
    onCompleted: ({submitGsva}) => {
      if (RA.isNotNil(submitGsva.wesID)) {
        setSubmitted(true)
      }
    },
  })

  useEffect(() => {
    if (gsvaData) {
      refetchRunStatus()
    }
  }, [gsvaData])

  const loading = loadingRunQuery || loadingSubmitGSVA
  return {submitGsva, run, loading, submitted}
}