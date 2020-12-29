import React, {useState} from 'react'

import {Button} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks'


const DownloadResultsButton = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const [clicked, setClicked] = useState(false)


  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status: runStatus} = run

  return (
    <Button fluid color='violet'
      content={R.prop(runStatus, {
        pending: 'RESULTS UNAVAILABLE',
        submitted: 'DOWNLOAD AVAILABLE ON COMPLETE',
        completed: 'DOWNLOAD RESULTS AND LOGS',
        failed: 'DOWNLOAD RUN LOGS'
      })}
      disabled={
        // R.or(R.either(R.equals('pending'), R.equals('submitted'))(runStatus)),(RA.isFalse(downloadable))
        // R.either(R.equals('pending'), R.equals('submitted'))(runStatus)
        R.any(RA.isTrue, [
          R.either(R.equals('pending'), R.equals('submitted'))(runStatus),
          clicked,
          // R.not(downloadable)
        ])}
      download
      target='_blank'
      // Should only work with nginx reverse proxy
      // see: https://github.com/suluxan/crescent-frontend/commit/8300e985804518ce31e1de9c3d3b340ee94de3f6
      href={`/express/download/${runID}`}
      onClick={() => {
        setClicked(true)
      }}
    />
  )
}

export default DownloadResultsButton