import React, {useEffect} from 'react'
import {Icon, Message} from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useSecondaryRunLogsQuery} from '../../../../apollo/hooks/run'

import {useAnnotations, useCrescentContext} from '../../../../redux/hooks'

const SecondaryRunFinishing = () => (
  <Message
    color="violet"
    icon
  >
    <Icon
      loading
      name='circle notched'
    />
    <Message.Content>
      <Message.Header>Finishing</Message.Header>
      Please wait a moment...
    </Message.Content>
  </Message>
)

const SecondaryRunNoLogs = () => (
  <>
    No Logs Available
  </>
)

const SecondaryRunDockerLogs = () => {
  const {logsIsAvailable, secondaryRunWesID, logsWasAvailable} = useAnnotations()
  const {runID} = useCrescentContext()
  const {logs, startPolling, stopPolling} = useSecondaryRunLogsQuery(runID, secondaryRunWesID)
  
  useEffect(() => {
    if (RA.isNotNil(secondaryRunWesID)) startPolling(1000)
  }, [secondaryRunWesID, startPolling])

  useEffect(() => {
    // Don't poll for logs if logsWasAvailable is true
    // (i.e. when the docker container has stopped after the secondary run has been completed)
    if (logsWasAvailable) stopPolling()
  }, [stopPolling, logsWasAvailable])

  // Utility functions for formatting and cleaning up the logs
  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const includesThreeAsterisks  = R.compose(R.includes, RA.concatAll, R.repeat('*'))(3) // Only check for 3 astericks as GSVA logs don't contain 4 astericks
  const trimUnicode = str => str.substring(R.indexOf('*')(str))
  const mapToParagraph = R.addIndex(R.map)((comment, index) => <p key={index}>{comment}</p>)

  return (
    <>
      {
        R.or(R.not(logsIsAvailable), R.either(R.isNil, R.isEmpty)(logs)) ? (
          <SecondaryRunNoLogs />
        ) : (
          <>
            {
              R.compose(
                mapToParagraph,
                R.map(trimUnicode),
                R.filter(includesThreeAsterisks),
                splitByNewLine
              )(logs)
            }
          </>
        )
      }
    </>
  )
}

export {
  SecondaryRunDockerLogs,
  SecondaryRunFinishing,
  SecondaryRunNoLogs
}