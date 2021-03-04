import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

export default function useSubmitRunMutation(runID) {
  // const run = useRunDetailsQuery(runID)

  const [run, setRun] = useState(null)
  const [submitted, setSubmitted] = useState(true) //start true
  const {loading: loadingRunQuery, data, error, refetch} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        wesID
        status
        referenceDatasets {
          datasetID
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
  return {submitRun, run, loading, submitted}
}