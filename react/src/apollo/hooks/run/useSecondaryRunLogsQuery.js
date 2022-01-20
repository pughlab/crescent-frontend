import {useEffect} from 'react'
import {useActor} from '@xstate/react'
import {useLazyQuery} from '@apollo/react-hooks'
import {gql} from 'apollo-boost'
import * as RA from 'ramda-adjunct'
import {useAnnotations} from '../../../redux/hooks'

export default function useSecondaryRunLogsQuery(annotationType, runID, secondaryRunWesID) {
  const {annotationsService: service} = useAnnotations()
  const [, send] = useActor(service)

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

      send({
        type: 'LOGS_UPDATE',
        logs: logsFromPolling
      })
    }
  }, [data, send])

  return getSecondaryRunLogs
}