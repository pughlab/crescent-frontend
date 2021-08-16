import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import { RUN_STATUS_SUBMIT_GSVA, SUBMIT_GSVA } from '../../queries/run'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useSubmitGSVAMutation(runID) {
  // const run = useRunDetailsQuery(runID)

  const [run, setRun] = useState(null)
  const [submitted, setSubmitted] = useState(true) //start true
  const {loading: loadingRunQuery, data, error, refetch: refetchRunStatus} = useQuery(RUN_STATUS_SUBMIT_GSVA, {
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

  const [submitGsva, {loading: loadingSubmitGSVA, data: gsvaData}] = useMutation(SUBMIT_GSVA, {
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