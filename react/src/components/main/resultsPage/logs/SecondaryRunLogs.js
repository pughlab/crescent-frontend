import {useEffect} from 'react'
import {useActor} from '@xstate/react'
import {Divider, Segment} from 'semantic-ui-react'
import * as R from 'ramda'

import {useSecondaryRunLogsQuery} from '../../../../apollo/hooks/run'

import {useMachineServices, useCrescentContext, useResultsPage} from '../../../../redux/hooks'

import SecondaryRunLogsContent from './SecondaryRunLogsContent'

const SecondaryRunLogs = () => {
  const {annotationsService: service} = useMachineServices()
  const {runID} = useCrescentContext()
  const {activeAnnotationsAction} = useResultsPage()

  const [{context: {annotationType, logs, secondaryRunWesID}}, ] = useActor(service)

  const getSecondaryRunLogs = useSecondaryRunLogsQuery(annotationType, runID, secondaryRunWesID)
  
  useEffect(() => {
    getSecondaryRunLogs()
  }, [getSecondaryRunLogs])

  return (
    <>
      <Divider horizontal content={`${activeAnnotationsAction} Logs`} />
      <Segment
        color="purple"
        style={{
          maxHeight: '40vh',
          overflowY: 'auto'
        }}
      >
        { R.either(R.isNil, R.isEmpty)(logs) ? (
          <>
            No Logs Available
          </>
        ) : (
          <SecondaryRunLogsContent />
        )}
      </Segment>
    </>
  )
}

export default SecondaryRunLogs