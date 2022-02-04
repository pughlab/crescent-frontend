import React, {useState, useCallback, useEffect} from 'react'
import {useActor} from '@xstate/react'
import {Button, Divider, Header, Icon, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {useMachineServices} from '../../../../redux/hooks'
import {useSecondaryRunEvents} from '../../../../xstate/hooks'

export default function UploadSampleAnnotsButton({ prevSampleAnnots, currSampleAnnots }) {
  const {annotationsService: service} = useMachineServices()
  // const {userID: currentUserID} = useCrescentContext()
  const [sampleAnnotsFile, setSampleAnnotsFile] = useState(null)
  const [isPrevSampleAnnotsAvailable, setIsPrevSampleAnnotsAvailable] = useState(false)
  const {uploadInput} = useSecondaryRunEvents()

  useEffect(() => {
    setIsPrevSampleAnnotsAvailable(isPrevSampleAnnotsAvailable => R.and(
      // If isPrevSampleAnnotsAvailable is null that means that a new sample annotations file had been uploaded,
      // so the option to use previously uploaded sample annotations should be disabled or remain disabled
      RA.isNotNil(isPrevSampleAnnotsAvailable),
      // The option to use previous sample annotations should only be be enabled if it exists
      // and it contains one or more normal cell types
      RA.neither(R.isNil, RA.isEmptyArray)(prevSampleAnnots)
    ))
  }, [prevSampleAnnots])
  
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setSampleAnnotsFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const inputIndex = 0
  const usingPrevUploadedSampleAnnots = R.equals(prevSampleAnnots, currSampleAnnots)

  const [{context: {inputsReady}, matches}] = useActor(service)
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
      Upload/replace sample annotations with barcodes in txt format
      { !isPrevSampleAnnotsAvailable || usingPrevUploadedSampleAnnots ? '.' : ' or use previously uploaded sample annotations.' }
      { isPrevSampleAnnotsAvailable && (
        <>
          <br />
          <br />
          <Button
            fluid
            color="purple"
            content={`${usingPrevUploadedSampleAnnots ? 'Currently using' : 'Use'} previously uploaded sample annotations`}
            disabled={uploadLoading || usingPrevUploadedSampleAnnots}
            icon={usingPrevUploadedSampleAnnots ? 'check circle' : 'copy'}
            loading={uploadLoading}
            onClick={() => {
              uploadInput({
                inputIndex,
                uploadOptions: {
                  type: 'previousUpload'
                }
              })
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
                    // Set isPrevSampleAnnotsAvailable to null given that a new sample annotations file is being uploaded
                    // Since prevSampleAnnots gets refetched, we want to keep the option to use previously uploaded sample annotations (which would simply be the current sample annotations that were uploaded) disabled
                    setIsPrevSampleAnnotsAvailable(null)
                    uploadInput({
                      inputIndex: 0,
                      uploadOptions: {
                        newUpload: true,
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