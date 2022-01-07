import React, {useState, useCallback, useEffect} from 'react'
import {useActor} from '@xstate/react'
import {Button, Divider, Header, Icon, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useAnnotations} from '../../../../redux/hooks'

export default function UploadSampleAnnotsButton({ sampleAnnots }) {
  const {annotationsService: service} = useAnnotations()
  // const {userID: currentUserID} = useCrescentContext()
  const [sampleAnnotsFile, setSampleAnnotsFile] = useState(null)
  const [usedPrevUploadedSampleAnnots, setUsedPrevUploadedSampleAnnots] = useState(false)
  
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setSampleAnnotsFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const inputIndex = 0

  const [{context: {inputsReady}, matches}, send] = useActor(service)
  const secondaryRunSubmitted = matches('secondaryRunSubmitted')
  const isStatus = status => R.both(RA.isNotNil, R.compose(
    R.equals(status),
    R.head,
    RA.pickIndexes([inputIndex])
  ))(inputsReady)
  const [uploadLoading, uploadSuccess, uploadFailed] = R.map(isStatus, ['loading', 'success', 'failed'])

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  useEffect(() => {
    if (secondaryRunSubmitted) setSampleAnnotsFile(null)
  }, [secondaryRunSubmitted])

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
            content={`${usedPrevUploadedSampleAnnots ? 'Currently using' : 'Use'} previously uploaded sample annotations`}
            disabled={uploadLoading || usedPrevUploadedSampleAnnots}
            icon={usedPrevUploadedSampleAnnots ? 'check circle' : 'copy'}
            loading={uploadLoading}
            onClick={() => {
              send({
                type: 'UPLOAD_INPUT',
                inputIndex,
                uploadOptions: {
                  type: 'previousUpload'
                }
              })
              setUsedPrevUploadedSampleAnnots(true)
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
            <Segment placeholder loading={uploadLoading}>
              <Header
                content={R.isNil(sampleAnnotsFile) ? 'Drag and drop a sample_annots.txt or click to select file' : sampleAnnotsFile.name}
                textAlign="center"
              />
              { RA.isNotNil(sampleAnnotsFile) && (
                <Button
                  color="purple"
                  content={R.toUpper(
                    uploadLoading ? 'Uploading' :
                    uploadFailed ? 'Upload failed, please try again' :
                    uploadSuccess ? 'Reupload' :
                    'Upload'
                  )}
                  disabled={R.isNil(sampleAnnotsFile) || uploadLoading}
                  onClick={e => {
                    e.stopPropagation()
                    send({
                      type: 'UPLOAD_INPUT',
                      inputIndex: 0,
                      uploadOptions: {
                        type: 'newUpload',
                        variables: {
                          sampleAnnots: sampleAnnotsFile
                        }
                      }
                    })
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