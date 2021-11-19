import React, {useState, useCallback, useEffect} from 'react'
import {Button, Divider, Header, Icon, Image, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

import {useUploadRunGenesetMutation} from '../../../../apollo/hooks/run'
import {useSubmitGSVAMutation} from '../../../../apollo/hooks/run'

import {useAnnotations} from '../../../../redux/hooks'

import SecondaryRunLogs from '../logs/SecondaryRunLogs'
import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

export default function UploadGenesetButton({ runID }) {
  const {secondaryRunWesID} = useAnnotations()
  // const {userID: currentUserID} = useCrescentContext()
  const {uploadRunGeneset, loading: loadingUpload, genesetUploaded} = useUploadRunGenesetMutation({runID})
  const {submitGsva, run, loading: loadingGSVA, secondaryRunSubmitted} = useSubmitGSVAMutation(runID)
  const [secondaryRuns, setSecondaryRuns] = useState(null)
  const [genesetFile, setGenesetFile] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setGenesetFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const loading = loadingUpload || loadingGSVA

  const annotationType = 'GSVA'

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
                <Segment placeholder loading={loading}>
                  <Header
                    content={R.isNil(genesetFile) ? 'Drag and drop a geneset.gmt file or click to select file' : genesetFile.name}
                    textAlign="center"
                  />
                  {
                    R.or(RA.isNotNil(genesetFile), loading) &&
                    <Button
                      color="purple"
                      content={R.toUpper(loadingUpload ? 'Uploading' : R.both(RA.isNotNil, R.not)(genesetUploaded) ? 'Upload failed, please try again' : loadingGSVA ? 'Submitting' : 'Confirm')}
                      disabled={loading}
                      onClick={e => {
                        e.stopPropagation()
                        uploadRunGeneset({variables: {geneset: genesetFile}}).then(({data: {uploadRunGeneset}}) => {
                          if (RA.isNotNil(uploadRunGeneset)) submitGsva()
                        })
                      }}
                    />
                  }
                </Segment>
              </div>
            }
          </Segment>
        </Message>
      ) : (
        <SecondaryRunLogs />
      )}
      { R.either(R.isNil, RA.isEmptyArray)(secondaryRuns) ? (
        <Fade up>
          <Divider horizontal content="GSVA Run Status" />
          <Segment color="purple">    
            <Segment placeholder>
              <Header icon>
                <Icon name="exclamation" />
                No GSVA Runs
              </Header>
            </Segment>
          </Segment>
        </Fade>
      ) : (
        <AnnotationsSecondaryRuns {...{annotationType, secondaryRuns}} />
      )}
    </>
  )
}