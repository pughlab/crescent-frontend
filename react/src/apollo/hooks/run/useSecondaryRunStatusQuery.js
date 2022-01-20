import {useEffect, useState} from 'react'
import {useActor} from '@xstate/react'
import {useLazyQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useAnnotations} from '../../../redux/hooks'

const useCancelSecondaryRunMutation = (runID, secondaryRunWesID) => {
  const {annotationsService: service} = useAnnotations()
  const [secondaryRunCompletedOn, setSecondaryRunCompletedOn] = useState(null)
  const [secondaryRunStatus, setSecondaryRunStatus] = useState(null)
  
  const [, send] = useActor(service)

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
      send({ type: `SECONDARY_RUN_${R.toUpper(status)}` })
    }
  }, [send, statusData])

  useEffect(() => {
    if (RA.isNotNil(completedOnData)) {
      const {secondaryRun: {completedOn}} = completedOnData
      setSecondaryRunCompletedOn(completedOn)
    }
  }, [completedOnData])

  return {getCompletedOn, getStatus, secondaryRunCompletedOn, secondaryRunStatus, stopStatusPolling}
}

export default useCancelSecondaryRunMutation