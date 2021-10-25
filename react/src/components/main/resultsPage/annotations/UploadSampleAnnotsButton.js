import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Message, Image, Grid } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

// import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

import {useUploadSampleAnnotsMutation} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useSubmitGSVAMutation, useSubmitInferCNVMutation} from '../../../../apollo/hooks/run'

import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

export default function UploadSampleAnnotsButton({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  // const run = useRunDetailsQuery(runID)
  const {uploadSampleAnnots, loading, success} = useUploadSampleAnnotsMutation({runID})
  const [sampleAnnotsFile, setSampleAnnotsFile] = useState(null)
  useEffect(() => {if (success) setSampleAnnotsFile(null)}, [success])
  const onDrop = useCallback(acceptedFiles => {if (RA.isNotEmpty(acceptedFiles)) {setSampleAnnotsFile(R.head(acceptedFiles))}}, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  // const {submitGsva, run, loading: loadingGSVA, submitted} = useSubmitGSVAMutation(runID)
  const {submitInfercnv, run, loading: loadingInferCNV, submitted} = useSubmitInferCNVMutation(runID)


  if (R.any(R.isNil, [run])) {
    return (
      null
      // <Segment basic style={{ height: '100%' }} placeholder>
      //   <Tada forever duration={1000}>
      //     <Image src={Logo} centered size='medium' />
      //   </Tada>
      // </Segment>
    )
  }

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  const {secondaryRuns} = run


  return (
    <>
            <Message color='purple'>
              <Icon name='upload'/>
              Upload/replace sample annotations with barcodes in txt format.
            <Segment inverted={success} color='purple'>
              {
              // disabledUpload ? 
              //   <Segment placeholder>
              //     <Header textAlign='center' content={'You do not have permissions to upload geneset for this run'} />
              //   </Segment>
              // :
                <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Segment placeholder loading={loading}>
                  <Header textAlign='center'
                    content={R.isNil(sampleAnnotsFile) ? 'Drag and drop a sample_annots.txt or click to select file' : sampleAnnotsFile.name}
                  />
                  {
                    RA.isNotNil(sampleAnnotsFile) &&
                    <Button color='purple'
                      // onClick={() => uploadRunGeneset({variables: {geneset: genesetFile}}) && submitGsva()}
                      onClick={() => uploadSampleAnnots({variables: {sampleAnnots: sampleAnnotsFile}})}
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