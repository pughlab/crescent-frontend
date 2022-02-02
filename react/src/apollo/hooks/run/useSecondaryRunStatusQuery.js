import {useEffect, useState} from 'react'
import {useLazyQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import {useSecondaryRunEvents} from '../../../xstate/hooks'

const useCancelSecondaryRunMutation = (runID, secondaryRunWesID) => {
  const [secondaryRunCompletedOn, setSecondaryRunCompletedOn] = useState(null)
  const [secondaryRunStatus, setSecondaryRunStatus] = useState(null)
  const {updateStatus} = useSecondaryRunEvents()

  const [getStatus, {data: statusData, stopPolling: stopStatusPolling}] = useLazyQuery(gql`
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
      updateStatus({status})
    }
  }, [statusData, updateStatus])

  useEffect(() => {
    if (RA.isNotNil(completedOnData)) {
      const {secondaryRun: {completedOn}} = completedOnData
      setSecondaryRunCompletedOn(completedOn)
    }
  }, [completedOnData])

  return {getCompletedOn, getStatus, secondaryRunCompletedOn, secondaryRunStatus, stopStatusPolling}
}

export default useCancelSecondaryRunMutation