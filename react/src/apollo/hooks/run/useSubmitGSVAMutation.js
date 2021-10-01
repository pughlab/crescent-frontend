import {useState, useEffect} from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {setSecondaryRun} from '../../../redux/actions/annotations'
import {useAnnotations} from '../../../redux/hooks'

export default function useSubmitGSVAMutation(runID) {
  const dispatch = useDispatch()
  const {secondaryRunSubmitted} = useAnnotations()
  const [run, setRun] = useState(null)

  const {loading: loadingRunQuery, data, refetch: refetchRunStatus} = useQuery(gql`
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
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (data) setRun(data.run)
  }, [dispatch, data])

  useEffect(() => {
    if (RA.isNotNil(run) && RA.isNonEmptyArray(run.secondaryRuns)) {
      // Get the status and wesID of the most recent secondary run
      const [latestSecondaryRunStatus, latestSecondaryRunWesID] = R.compose(
        R.props(['status', 'wesID']),
        R.last
      )(run.secondaryRuns)

      if (R.equals('submitted', latestSecondaryRunStatus)) dispatch(setSecondaryRun({secondaryRunWesID: latestSecondaryRunWesID}))
    }
  }, [dispatch, run])

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
      if (RA.isNotNil(submitGsva.wesID)) dispatch(setSecondaryRun({secondaryRunWesID: submitGsva.wesID}))
    },
  })

  useEffect(() => {
    if (gsvaData) refetchRunStatus()
  }, [gsvaData, refetchRunStatus])

  const loading = loadingRunQuery || loadingSubmitGSVA
  return {submitGsva, run, loading, secondaryRunSubmitted}
}