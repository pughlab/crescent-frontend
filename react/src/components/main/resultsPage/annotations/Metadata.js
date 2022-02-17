import {useEffect} from 'react'
import * as RA from 'ramda-adjunct'

import {useSecondaryRunEvents} from '../../../../xstate/hooks'

import {useRunUploadNamesQuery, useUploadRunMetadataMutation} from '../../../../apollo/hooks/run'

import UploadRunMetadataButton from './UploadRunMetadataButton'
import UploadedMetadataList from './UploadedMetadataList'

const Metadata = ({ runID }) => {
  const uploadRunMetadata = useUploadRunMetadataMutation(runID)
  const {uploadNames, refetchUploadNames} = useRunUploadNamesQuery(runID)
  const {annotationTypeInit} = useSecondaryRunEvents()

  useEffect(() => {
    annotationTypeInit({
      annotationType: 'Metadata',
      inputConditions: [
        RA.isNotNil
      ],
      onComplete: () => {
        refetchUploadNames()
      },
      submittable: false,
      uploadFunctions: [
        // inputIndex 0 - run metadata upload
        uploadRunMetadata
      ]
    })
  }, [annotationTypeInit, refetchUploadNames, uploadRunMetadata])

  return (
    <>
      <UploadRunMetadataButton {...{runID}} />
      <UploadedMetadataList {...{uploadNames}} />
    </>
  )
}

export default Metadata