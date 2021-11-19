import React from 'react'
import {Divider, Segment} from 'semantic-ui-react'
import * as R from 'ramda'

import {SecondaryRunFinishing, SecondaryRunNoLogs, SecondaryRunDockerLogs} from './SecondaryRunLogsContent'

import {useAnnotations, useResultsPage} from '../../../../redux/hooks'

const SecondaryRunLogs = () => {
  const {secondaryRunWesID, logsWasAvailable} = useAnnotations()
  const {activeAnnotationsAction} = useResultsPage()

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
        {
          logsWasAvailable ? (
            <SecondaryRunFinishing />
          ) : R.isNil(secondaryRunWesID) ? (
            <SecondaryRunNoLogs />
          ) : (
            <SecondaryRunDockerLogs />
          ) 
        }
      </Segment>
    </>
  )
}

export default SecondaryRunLogs