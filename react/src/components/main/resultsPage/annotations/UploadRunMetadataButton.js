import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Message } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useUploadRunMetadataMutation} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'


export default function UploadMetadataButton({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {uploadRunMetadata, loading, success} = useUploadRunMetadataMutation({runID})
  const [metadataFile, setMetadataFile] = useState(null)
  useEffect(() => {if (success) setMetadataFile(null)}, [success])
  const onDrop = useCallback(acceptedFiles => {if (RA.isNotEmpty(acceptedFiles)) {setMetadataFile(R.head(acceptedFiles))}}, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  

  return (
    <>
      <Message color='purple'>
        <Icon name='upload'/>
        Upload/replace metadata for this Run in this <a target="_blank" href='https://pughlab.github.io/crescent-frontend/#item-2-2' >format.</a> 
      <Segment inverted={success} color='purple'>
        {
        disabledUpload ? 
          <Segment placeholder>
            <Header textAlign='center' content={'You do not have permissions to upload metadata for this dataset'} />
          </Segment>
        :
          <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Segment placeholder loading={loading}>
            <Header textAlign='center'
              content={R.isNil(metadataFile) ? 'Drag and drop a metadata.tsv file or click to select file' : metadataFile.name}
            />
            {
              RA.isNotNil(metadataFile) &&
              <Button color='purple'
                onClick={() => uploadRunMetadata({variables: {metadata: metadataFile}})}
                content={success ? 'Uploaded' : 'Confirm'}
              />
            }
          </Segment>
          </div>
        }
      </Segment>
      </Message>
    </>
  )
}