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

import {useAnnotations} from '../../../../redux/hooks'

import SecondaryRunLogs from '../logs/SecondaryRunLogs'
import AnnotationsSecondaryRuns, {NoSecondaryRuns} from './AnnotationsSecondaryRuns'

export default function UploadGenesetButton({ runID }) {
  const {annotationsService: service} = useAnnotations()
  // const {userID: currentUserID} = useCrescentContext()
  const uploadRunGeneset = useUploadRunGenesetMutation(runID)
  const {submitGsva, run} = useSubmitGSVAMutation(runID)
  const [secondaryRuns, setSecondaryRuns] = useState(null)
  const [genesetFile, setGenesetFile] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setGenesetFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const annotationType = 'GSVA'

  const [{context: {inputsReady, secondaryRunWesID}, matches}, send] = useActor(service)
  const secondaryRunSubmitted = matches('secondaryRunSubmitted')
  const isStatus = status => R.both(RA.isNotNil, R.compose(
    R.equals(status),
    R.head
  ))(inputsReady)
  const [uploadLoading, uploadSuccess, uploadFailed] = R.map(isStatus, ['loading', 'success', 'failed'])

  useEffect(() => {
    send({
      type: 'ANNOTATION_TYPE_INIT',
      annotationType,
      // The predicates that the respective input must satisfy before the secondary run can be submitted
      inputConditions: [
        RA.isNotNil
      ],
      // Labels for input upload status checklist
      inputChecklistLabels: [
        'Geneset file (.gmt format)'
      ],
      // Submission function for the secondary run
      submitFunction: submitGsva,
      // Function for uploading/handling the respective input
      // NOTE: each must be a function (the function will be passed uploadOptions)
      // that returns a promise that resolves with the upload results in the form of {data: results} 
      // (which will then verified with the respective input condition)
      uploadFunctions: [
        // inputIndex 0 - geneset file upload
        uploadRunGeneset
      ]
    })
  }, [send, submitGsva, uploadRunGeneset])

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
      { R.isNil(secondaryRunWesID) ? (
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
                        send({
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