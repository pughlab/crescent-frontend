import {useEffect} from 'react'
import {useActor} from '@xstate/react'
import {useQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import {useAnnotations} from '../../../redux/hooks'

export default function useSecondaryRunLogsQuery(annotationType, runID, secondaryRunWesID) {
  const {annotationsService: service} = useAnnotations()
  const [{context: {logs}}, send] = useActor(service)

  const {loading, data, startPolling, stopPolling} = useQuery(gql`
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
    }
  })

  useEffect(() => {
    if (RA.isNotNil(data)) {
      const {secondaryRun: {logs: logsFromPolling}} = data

      send({
        type: 'LOGS_UPDATE',
        logs: logsFromPolling
      })
    }
  }, [data, send])

  return {logs, loading, startPolling, stopPolling}
}