import React from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useActor} from '@xstate/react'

import {useMachineServices} from '../../../../redux/hooks'

const SecondaryRunLogsContent = () => {
  const {annotationsService: service} = useMachineServices()

  const [{context: {logs}}] = useActor(service)

  // Utility functions for formatting and cleaning up the logs
  const splitByNewLine = R.compose(R.map(R.trim), R.split('\n'))
  const includesThreeAsterisks  = R.compose(R.includes, RA.concatAll, R.repeat('*'))(3) // Only check for 3 astericks as GSVA logs don't contain 4 astericks
  const trimUnicode = str => str.substring(R.indexOf('*')(str))
  const mapToParagraph = R.addIndex(R.map)((comment, index) => <p key={index}>{comment}</p>)

  return (
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

export default SecondaryRunLogsContent