import {useState, useEffect} from 'react'
import {useQuery, useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import {grapheneClient as client} from '../../clients'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {setSecondaryRun} from '../../../redux/actions/annotations'
import {useAnnotations} from '../../../redux/hooks'

export default function useSubmitInferCNVMutation(runID) {
  const dispatch = useDispatch()
  const {secondaryRunSubmitted} = useAnnotations()
  const [run, setRun] = useState(null)

  const {loading: loadingRunQuery, data, refetch: refetchRunStatus} = useQuery(gql`
    query RunStatus($runID: ID) {
      run(runID: $runID) {
        secondaryRuns {
          wesID
          type
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
  }, [data])

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

  const [submitInferCNV, {loading: loadingSubmitInferCNV, data: infercnvData}] = useMutation(gql`
    mutation SubmitInferCNV($runID: ID) {
      submitInfercnv(runId: $runID) {
        wesID
      }
    }
  `, {
    client,
    variables: {runID},    
    onCompleted: ({submitInfercnv}) => {
      if (RA.isNotNil(submitInfercnv.wesID)) dispatch(setSecondaryRun({secondaryRunWesID: submitInfercnv.wesID}))
    },
  })

  useEffect(() => {
    if (infercnvData) refetchRunStatus()
  }, [infercnvData, refetchRunStatus])

  const loading = loadingRunQuery || loadingSubmitInferCNV
  return {submitInferCNV, run, loading, secondaryRunSubmitted}
}