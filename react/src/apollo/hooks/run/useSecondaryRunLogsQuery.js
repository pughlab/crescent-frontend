import {useEffect, useState} from 'react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import {useDispatch} from 'react-redux'
import {setLogsAvailable} from '../../../redux/actions/annotations'
import {useAnnotations} from '../../../redux/hooks'

export default function useSecondaryRunLogsQuery(runID, secondaryRunWesID) {
  const dispatch = useDispatch()
  const {logsIsAvailable} = useAnnotations()
  const [logs, setLogs] = useState(null)

  const {loading, data, startPolling, stopPolling} = useQuery(gql`
    query SecondaryRunLogs($runID: ID, $secondaryRunWesID: ID) {
      secondaryRun(runID: $runID, wesID: $secondaryRunWesID) {
        logs(runID: $runID)
      }
    }
  `, {
    variables: {
      runID,
      secondaryRunWesID
    }
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {secondaryRun: {logs: logsFromPolling}} = data
      const logsIsAvailableFromPolling = RA.isNotNil(logsFromPolling)

      setLogs(logsFromPolling)
      if (logsIsAvailable !== logsIsAvailableFromPolling) dispatch(setLogsAvailable({logsIsAvailable: logsIsAvailableFromPolling}))
    }
  }, [data, dispatch, logsIsAvailable])

  return {logs, loading, startPolling, stopPolling}
}