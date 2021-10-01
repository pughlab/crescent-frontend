import React, {useState, useCallback, useEffect} from 'react'
import {Button, Divider, Header, Icon, Image, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

import {useUploadRunGenesetMutation} from '../../../../apollo/hooks/run'
import {useSubmitGSVAMutation} from '../../../../apollo/hooks/run'

import {useDispatch} from 'react-redux'
import {useAnnotations} from '../../../../redux/hooks'

import SecondaryRunLogs from '../logs/SecondaryRunLogs'
import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

export default function UploadGenesetButton({ runID }) {
  const dispatch = useDispatch()
  const {secondaryRunWesID} = useAnnotations()
  // const {userID: currentUserID} = useCrescentContext()
  const {uploadRunGeneset, loading: loadingUpload, genesetUploaded} = useUploadRunGenesetMutation({runID})
  const {submitGsva, run, loading: loadingGSVA, secondaryRunSubmitted} = useSubmitGSVAMutation(runID)
  const [secondaryRuns, setSecondaryRuns] = useState(null)
  const [genesetFile, setGenesetFile] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) {
      setGenesetFile(R.head(acceptedFiles))
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const loading = loadingUpload || loadingGSVA

  useEffect(() => {
    if (secondaryRunSubmitted) setGenesetFile(null)
  }, [secondaryRunSubmitted])
  
  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {secondaryRuns: secondaryRunsFromQuery} = run
      setSecondaryRuns(secondaryRunsFromQuery)
    }
  }, [dispatch, run])

  if (R.isNil(run)) {
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))

  return (
    <>
      { R.isNil(secondaryRunWesID) ? (
        <>
          <Message color='purple'>
            <Icon name='upload'/>
            Upload/replace geneset for this Run in the GMT format.
          </Message>
          <Segment inverted={RA.isNotNil(genesetFile)} color='purple'>
            {
            // disabledUpload ? 
            //   <Segment placeholder>
            //     <Header textAlign='center' content={'You do not have permissions to upload geneset for this run'} />
            //   </Segment>
            // :
              <div {...getRootProps()}>
              <Segment placeholder loading={loading}>
                <Header
                  content={R.isNil(genesetFile) ? 'Drag and drop a geneset.gmt file to run GSVA' : genesetFile.name}
                  textAlign='center'
                />
                {
                  R.or(RA.isNotNil(genesetFile), loading) &&
                  <Button
                    color="purple"
                    disabled={loading}
                    content={R.toUpper(loadingUpload ? 'Uploading' : R.both(RA.isNotNil, R.not)(genesetUploaded) ? 'Upload failed, please try again' : loadingGSVA ? 'Submitting' : 'Confirm')}
                    onClick={() => uploadRunGeneset({variables: {geneset: genesetFile}}).then(({data: {uploadRunGeneset}}) => {
                      if (RA.isNotNil(uploadRunGeneset)) submitGsva()
                    })}
                  />
                }
              </Segment>
              </div>
            }
          </Segment>
        </>
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
        <AnnotationsSecondaryRuns {...{secondaryRuns}} />
      )}
    </>
  )
}