import {useEffect} from 'react'
import {useLazyQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import {useSecondaryRunEvents} from '../../../redux/helpers/machines/SecondaryRunMachine/useSecondaryRunMachine'

export default function useSecondaryRunLogsQuery(annotationType, runID, secondaryRunWesID) {
  const {updateLogs} = useSecondaryRunEvents()

  const [getSecondaryRunLogs, {data}] = useLazyQuery(gql`
    query SecondaryRunLogs($annotationType: String, $runID: ID, $secondaryRunWesID: ID) {
      secondaryRun(runID: $runID, wesID: $secondaryRunWesID) {
        logs(annotationType: $annotationType, runID: $runID)
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {
      annotationType,
      runID,
      secondaryRunWesID
    },
    pollInterval: 1000
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {secondaryRun: {logs: logsFromPolling}} = data

      updateLogs({ logs: logsFromPolling })
    }
  }, [data, updateLogs])

  return getSecondaryRunLogs
}