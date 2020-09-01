import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useUploadDatasetMetadataMutation} from '../../../../apollo/hooks'

export default function UploadMetadataButton({
  datasetID
}) {
  const {uploadDatasetMetadata, loading, success} = useUploadDatasetMetadataMutation({datasetID})
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
          onClick={() => uploadDatasetMetadata({variables: {metadata: metadataFile}})}
          content={success ? 'Uploaded' : 'Confirm'}
        />
      }
    </Segment>
    </div>
  )
}