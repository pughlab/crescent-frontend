import React, {useState, useCallback, useEffect} from 'react'
import {Button, Icon, Segment, Header, Message } from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {resetAnnotations} from '../../../../redux/actions/annotations'

import {useRunDetailsQuery, useUploadRunMetadataMutation} from '../../../../apollo/hooks/run'

export default function UploadMetadataButton({
  refetchUploadNames,
  runID
}) {
  const dispatch = useDispatch()
  const {userID: currentUserID} = useCrescentContext()
  const {run} = useRunDetailsQuery(runID)
  const {uploadRunMetadata, loading, metadataUploaded} = useUploadRunMetadataMutation({runID})
  const [metadataFile, setMetadataFile] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setMetadataFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  useEffect(() => {
    if (metadataUploaded) setMetadataFile(null)
  }, [metadataUploaded])

  if (R.isNil(run)) return null

  const {createdBy: {userID: creatorUserID}} = run
  const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  return (
    <Message color="purple">
      <Icon name="upload" />
      Upload/replace metadata for this run in this <a target="_blank" href="https://pughlab.github.io/crescent-frontend/#item-2-2">format</a>.
      <Segment
        color="purple"
        inverted={RA.isNotNil(metadataFile)}
      >
        { disabledUpload ? (
          <Segment placeholder>
            <Header
              content="You do not have permissions to upload metadata for this dataset"
              textAlign="center"
            />
          </Segment>
        ) : (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Segment placeholder loading={loading}>
              <Header
                content={R.isNil(metadataFile) ? 'Drag and drop a metadata.tsv file or click to select file' : metadataFile.name}
                textAlign="center"
              />
              { RA.isNotNil(metadataFile) && (
                <Button
                  color="purple"
                  content={R.toUpper(loading ? 'Uploading' : R.both(RA.isNotNil, R.not)(metadataUploaded) ? 'Upload failed, please try again' : 'Confirm')}
                  onClick={e => {
                    e.stopPropagation()
                    uploadRunMetadata({variables: {metadata: metadataFile}}).then(({data: {uploadRunMetadata}}) => {
                      if (RA.isNotNil(uploadRunMetadata)) {
                        dispatch(resetAnnotations())
                        refetchUploadNames()
                      }
                    })
                  }}
                />
              )}
            </Segment>
          </div>
        )}
      </Segment>
    </Message>
  )
}