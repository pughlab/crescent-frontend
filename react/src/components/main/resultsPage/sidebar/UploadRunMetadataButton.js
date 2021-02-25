import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useUploadRunMetadataMutation} from '../../../../apollo/hooks/run'

export default function UploadMetadataButton({
  runID
}) {
  const {uploadRunMetadata, loading, success} = useUploadRunMetadataMutation({runID})
  const [metadataFile, setMetadataFile] = useState(null)
  useEffect(() => {
    if (success) setMetadataFile(null)
  }, [success])
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) {
      console.log(acceptedFiles)
      setMetadataFile(R.head(acceptedFiles))
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <div {...getRootProps()}>
    <Segment placeholder loading={loading}>
      <Header textAlign='center'
        content={
          R.isNil(metadataFile) ?  
            'Drag and drop a metadata.tsv file'
          : metadataFile.name
        }
      />
      {
        RA.isNotNil(metadataFile) &&
        <Button color='blue'
          onClick={() => uploadRunMetadata({variables: {metadata: metadataFile}})}
          content={success ? 'Uploaded' : 'Confirm'}
        />
      }
    </Segment>
    </div>
  )
}