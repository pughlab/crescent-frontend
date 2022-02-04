import React, {useState, useCallback, useEffect} from 'react'
import {useActor} from '@xstate/react'
import {Button, Header, Icon, Image, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

import {useUploadRunGenesetMutation} from '../../../../apollo/hooks/run'
import {useSubmitGSVAMutation} from '../../../../apollo/hooks/run'

import {useMachineServices} from '../../../../redux/hooks'
import {useSecondaryRunEvents} from '../../../../xstate/hooks'

import SecondaryRunLogs from '../logs/SecondaryRunLogs'
import AnnotationsSecondaryRuns, {NoSecondaryRuns} from './AnnotationsSecondaryRuns'

export default function UploadGenesetButton({ runID }) {
  const {annotationsService: service} = useMachineServices()
  // const {userID: currentUserID} = useCrescentContext()
  const uploadRunGeneset = useUploadRunGenesetMutation(runID)
  const {submitGsva, run} = useSubmitGSVAMutation(runID)
  const [secondaryRuns, setSecondaryRuns] = useState(null)
  const [genesetFile, setGenesetFile] = useState(null)
  const {annotationTypeInit, uploadInput} = useSecondaryRunEvents()

  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setGenesetFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const annotationType = 'GSVA'

  const [{context: {inputsReady}, value}] = useActor(service)
  const secondaryRunSubmitted = R.any(R.startsWith(R.__, value), ['secondaryRun', 'cancel'])
  const isStatus = status => R.both(RA.isNotNil, R.compose(
    R.equals(status),
    R.head
  ))(inputsReady)
  const [uploadLoading, uploadSuccess, uploadFailed] = R.map(isStatus, ['loading', 'success', 'failed'])

  useEffect(() => {
    annotationTypeInit({
      annotationType,
      inputConditions: [
        RA.isNotNil
      ],
      inputChecklistLabels: [
        'Geneset file (.gmt format)'
      ],
      submitFunction: submitGsva,
      uploadFunctions: [
        // inputIndex 0 - geneset file upload
        uploadRunGeneset
      ]
    })
  }, [annotationTypeInit, submitGsva, uploadRunGeneset])

  useEffect(() => {
    if (secondaryRunSubmitted) setGenesetFile(null)
  }, [secondaryRunSubmitted])
  
  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {secondaryRuns: secondaryRunsFromQuery} = run
      setSecondaryRuns(secondaryRunsFromQuery)
    }
  }, [run])

  if (R.isNil(run)) {
    return (
      <Segment
        basic
        placeholder
        style={{ height: '100%' }}
      >
        <Tada forever duration={1000}>
          <Image
            centered
            size="medium"
            src={Logo}
          />
        </Tada>
      </Segment>
    )
  }

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))

  return (
    <>
      { !secondaryRunSubmitted ? (
        <Message color="purple">
          <Icon name="upload" />
          Upload/replace geneset for this run in the GMT format.
          <Segment
            color="purple"
            inverted={RA.isNotNil(genesetFile)}
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
                    content={R.isNil(genesetFile) ? 'Drag and drop a geneset.gmt file or click to select file' : genesetFile.name}
                    textAlign="center"
                  />
                  { RA.isNotNil(genesetFile) && (
                    <Button
                      color="purple"
                      content={R.toUpper(
                        uploadLoading ? 'Uploading' :
                        uploadFailed ? 'Upload failed, please try again' :
                        uploadSuccess ? 'Reupload' :
                        'Upload'
                      )}
                      disabled={uploadLoading}
                      onClick={async e => {
                        e.stopPropagation()
                        uploadInput({
                          type: 'UPLOAD_INPUT',
                          inputIndex: 0,
                          uploadOptions: {
                            variables: {
                              geneset: genesetFile
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
      ) : (
        <SecondaryRunLogs />
      )}
      { R.isNil(secondaryRuns) ? (
        <NoSecondaryRuns {...{annotationType}} />
      ) : (
        <AnnotationsSecondaryRuns {...{annotationType, secondaryRuns}} />
      )}
    </>
  )
}