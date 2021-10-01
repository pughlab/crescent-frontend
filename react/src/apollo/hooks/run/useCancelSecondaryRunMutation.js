import {useEffect, useState} from 'react'
import {useLazyQuery, useMutation} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {setLogs} from '../../../redux/actions/annotations'

const useCancelSecondaryRunMutation = (runID, secondaryRunWesID) => {
  const dispatch = useDispatch()
  const [cancelFailed, setCancelFailed] = useState(false)
  const [loadingCancelSecondaryRun, setLoadingCancelSecondaryRun] = useState(false)
  const [secondaryRunCompletedOn, setSecondaryRunCompletedOn] = useState(null)
  const [secondaryRunStatus, setSecondaryRunStatus] = useState(null)

  const [getStatus, {data: statusData}] = useLazyQuery(gql`
    query SecondaryRunStatus($runID: ID, $secondaryRunWesID: ID) {
      secondaryRun(runID: $runID, wesID: $secondaryRunWesID) {
        status
      }
    }
  `, {
    variables: {
      runID,
      secondaryRunWesID
    },
    pollInterval: 1000,
    fetchPolicy: 'network-only'
  })

  const [getCompletedOn, {data: completedOnData}] = useLazyQuery(gql`
    query SecondaryRunCompletedOn($runID: ID, $secondaryRunWesID: ID) {
      secondaryRun(runID: $runID, wesID: $secondaryRunWesID) {
        completedOn
      }
    }
  `, {
    variables: {
      runID,
      secondaryRunWesID
    },
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (RA.isNotNil(statusData)) {
      const {secondaryRun: {status}} = statusData
      setSecondaryRunStatus(status)
    }
  }, [statusData])

  useEffect(() => {
    if (RA.isNotNil(completedOnData)) {
      const {secondaryRun: {completedOn}} = completedOnData
      setSecondaryRunCompletedOn(completedOn)
    }
  }, [completedOnData])

  const [cancelSecondaryRun, {loading: loadingFromMutation}] = useMutation(gql`
    mutation cancelSecondaryRun($runID: ID, $wesID: ID) {
      cancelSecondaryRun(runID: $runID, wesID: $wesID)
    }
  `, {
    variables: {
      runID,
      secondaryRunWesID
    },
    onCompleted: ({cancelSecondaryRun}) => {
      if (cancelSecondaryRun === 'failed') dispatch(setLogs({logs: null}))
      setCancelFailed(cancelSecondaryRun !== 'failed')
      setLoadingCancelSecondaryRun(false)
    }
  })

  useEffect(() => {
    setLoadingCancelSecondaryRun(loadingCancelSecondaryRun => loadingCancelSecondaryRun || loadingFromMutation)
  }, [loadingFromMutation])

  return {cancelFailed, cancelSecondaryRun, getCompletedOn, getStatus, loadingCancelSecondaryRun, secondaryRunCompletedOn, secondaryRunStatus}
}

export default useCancelSecondaryRunMutation