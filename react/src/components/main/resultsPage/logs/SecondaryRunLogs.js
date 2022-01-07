import React from 'react'
import {useActor} from '@xstate/react'
import {Divider, Segment} from 'semantic-ui-react'
import * as R from 'ramda'

import {SecondaryRunNoLogs, SecondaryRunDockerLogs} from './SecondaryRunLogsContent'

import {useAnnotations, useResultsPage} from '../../../../redux/hooks'

const SecondaryRunLogs = () => {
  const {annotationsService: service} = useAnnotations()
  const {activeAnnotationsAction} = useResultsPage()

  const [{context: {secondaryRunWesID}}, ] = useActor(service)

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
        { R.isNil(secondaryRunWesID) ? (
          <SecondaryRunNoLogs />
        ) : (
          <SecondaryRunDockerLogs />
        )}
      </Segment>
    </>
  )
}

export default SecondaryRunLogs