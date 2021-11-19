import React, {useState, useCallback, useEffect} from 'react'
import {Button, Divider, Header, Icon, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useUploadSampleAnnotsMutation, useUpdateNormalCellTypesMutation} from '../../../../apollo/hooks/run'

export default function UploadSampleAnnotsButton({
  refetchSampleAnnots,
  runID,
  sampleAnnots,
  secondaryRunSubmitted,
  setCurrSampleAnnots
}) {
  // const {userID: currentUserID} = useCrescentContext()
  const {uploadSampleAnnots, loading, sampleAnnotsUploaded} = useUploadSampleAnnotsMutation(runID)
  const {updateNormalCellTypes} = useUpdateNormalCellTypesMutation(runID)
  const [sampleAnnotsFile, setSampleAnnotsFile] = useState(null)
  
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setSampleAnnotsFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))

  useEffect(() => {
    if (secondaryRunSubmitted) setSampleAnnotsFile(null)
  }, [secondaryRunSubmitted])

  const updateCurrSampleAnnots = async () => {
    const {data: {sampleAnnots: sampleAnnotsResults}} = await refetchSampleAnnots()
    if (RA.isNotNil(sampleAnnotsResults)) setCurrSampleAnnots(sampleAnnotsResults)
  }

  return (
    <Message color="purple">
      <Icon name="upload" />
      { R.isNil(sampleAnnots) ? (
        <>
          Upload/replace sample annotations with barcodes in txt format.
        </>
      ) : (
        <>
          Upload/replace sample annotations with barcodes in txt format or use previously uploaded sample annotations.
          <br />
          <br />
          <Button
            fluid
            color="purple"
            content="Use previously uploaded sample annotations"
            onClick={async () => {
              // Clear the normal cell types from the previous InferCNV run
              await updateNormalCellTypes({variables: {normalCellTypes: []}})
              await updateCurrSampleAnnots(sampleAnnots)
            }}
          />
          <Divider horizontal content="Or" />
        </>
      )}
      <Segment
        color="purple"
        inverted={RA.isNotNil(sampleAnnotsFile)}
      >
        {
          // disabledUpload ?
          //   <Segment placeholder>
          //     <Header textAlign='center' content={'You do not have permissions to upload geneset for this run'} />
          //   </Segment>
          // :
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Segment placeholder loading={loading}>
              <Header
                content={R.isNil(sampleAnnotsFile) ? 'Drag and drop a sample_annots.txt or click to select file' : sampleAnnotsFile.name}
                textAlign="center"
              />
              { R.or(RA.isNotNil(sampleAnnotsFile), loading) && (
                <Button
                  color="purple"
                  content={R.toUpper(loading ? 'Uploading' : R.both(RA.isNotNil, R.not)(sampleAnnotsUploaded) ? 'Upload failed, please try again' : R.both(RA.isNotNil, RA.isTrue)(sampleAnnotsUploaded) ? 'Reupload' : 'Confirm')}
                  disabled={R.isNil(sampleAnnotsFile) || loading}
                  onClick={async e => {
                    e.stopPropagation()
                    // Clear the normal cell types from the previous InferCNV run
                    await updateNormalCellTypes({variables: {normalCellTypes: []}})
                    await uploadSampleAnnots({variables: {sampleAnnots: sampleAnnotsFile}})
                    await updateCurrSampleAnnots()
                  }}
                />
              )}
            </Segment>
          </div>
        }
      </Segment>
    </Message>
  )
}