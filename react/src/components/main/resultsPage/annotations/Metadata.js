import React, {useEffect} from 'react'
import {useActor} from '@xstate/react'
import * as RA from 'ramda-adjunct'

import {useAnnotations} from '../../../../redux/hooks'

import {useRunUploadNamesQuery, useUploadRunMetadataMutation} from '../../../../apollo/hooks/run'

import UploadRunMetadataButton from './UploadRunMetadataButton'
import UploadedMetadataList from './UploadedMetadataList'

const Metadata = ({ runID }) => {
  const {annotationsService: service} = useAnnotations()
  const uploadRunMetadata = useUploadRunMetadataMutation(runID)
  const {uploadNames, refetchUploadNames} = useRunUploadNamesQuery(runID)

  const [, send] = useActor(service)

  useEffect(() => {
    send({
      type: 'ANNOTATION_TYPE_INIT',
      annotationType: 'Metadata',
      // The predicate that the input must satisfy to be considered valid
      inputConditions: [
        RA.isNotNil
      ],
      // Function to run when the secondary run has completed (either completed or failed)
      onComplete: () => {
        refetchUploadNames()
      },
      // Set submittable to false since we only need to upload the metadata (i.e. there is no secondary run to submit)
      // For the same reason, inputChecklistLabels, submitFunction are both omitted
      submittable: false,
      // Function for uploading/handling the respective input
      // NOTE: each must be a function (the function will be passed uploadOptions)
      // that returns a promise that resolves with the upload results in the form of {data: results} 
      // (which will then verified with the respective input condition)
      uploadFunctions: [
        // inputIndex 0 - run metadata upload
        uploadRunMetadata
      ]
    })
  }, [send, refetchUploadNames, uploadRunMetadata])

  return (
    <>
      <UploadRunMetadataButton {...{runID}} />
      <UploadedMetadataList {...{uploadNames}} />
    </>
  )
}

export default Metadata