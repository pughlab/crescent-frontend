import React from 'react'

import {useRunUploadNamesQuery} from '../../../../apollo/hooks/run'

import UploadRunMetadataButton from './UploadRunMetadataButton'
import UploadedMetadataList from './UploadedMetadataList'

const Metadata = ({ runID }) => {
  const {uploadNames, refetchUploadNames} = useRunUploadNamesQuery(runID)

  return (
    <>
      <UploadRunMetadataButton {...{refetchUploadNames, runID}} />
      <UploadedMetadataList {...{uploadNames}} />
    </>
  )
}

export default Metadata