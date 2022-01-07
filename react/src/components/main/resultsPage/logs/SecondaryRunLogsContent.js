import React, {useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useActor} from '@xstate/react'

import {useSecondaryRunLogsQuery} from '../../../../apollo/hooks/run'

import {useAnnotations, useCrescentContext} from '../../../../redux/hooks'

const SecondaryRunNoLogs = () => (
  <>
    No Logs Available
  </>
)

const SecondaryRunDockerLogs = () => {
  const {annotationsService: service} = useAnnotations()
  const {runID} = useCrescentContext()
  
  const [{context: {annotationType, logs, secondaryRunWesID}}] = useActor(service)

  const {startPolling} = useSecondaryRunLogsQuery(annotationType, runID, secondaryRunWesID)
  
  useEffect(() => {
    if (RA.isNotNil(secondaryRunWesID)) startPolling(1000)
  }, [secondaryRunWesID, startPolling])

  // Utility functions for formatting and cleaning up the logs
  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const includesThreeAsterisks  = R.compose(R.includes, RA.concatAll, R.repeat('*'))(3) // Only check for 3 astericks as GSVA logs don't contain 4 astericks
  const trimUnicode = str => str.substring(R.indexOf('*')(str))
  const mapToParagraph = R.addIndex(R.map)((comment, index) => <p key={index}>{comment}</p>)

  return (
    <>
      {
        R.either(R.isNil, R.isEmpty)(logs) ? (
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
  SecondaryRunNoLogs
}