import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useSubmitInferCNVMutation(runID) {
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

  const [submitInfercnv, {loading: loadingSubmitInferCNV, data: infercnvData}] = useMutation(gql`
    mutation SubmitInferCNV($runID: ID) {
      submitInfercnv(runId: $runID) {
        wesID
      }
    }
  `, {
    client,
    variables: {runID},    
    onCompleted: ({submitInfercnv}) => {
      if (RA.isNotNil(submitInfercnv.wesID)) {
        setSubmitted(true)
      }
    },
  })

  useEffect(() => {
    if (infercnvData) {
      refetchRunStatus()
    }
  }, [infercnvData])

  const loading = loadingRunQuery || loadingSubmitInferCNV
  return {submitInfercnv, run, loading, submitted}
}