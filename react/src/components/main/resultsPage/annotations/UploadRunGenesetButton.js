import React, {useState, useCallback, useEffect} from 'react'

import {Button, Icon, Segment, Header, Message, Image } from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'

// import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

import {useUploadRunGenesetMutation} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useSubmitGSVAMutation} from '../../../../apollo/hooks/run'

import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

export default function UploadGenesetButton({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  // const run = useRunDetailsQuery(runID)
  const {uploadRunGeneset, loading, success} = useUploadRunGenesetMutation({runID})
  const [genesetFile, setGenesetFile] = useState(null)
  useEffect(() => {if (success) setGenesetFile(null)}, [success])
  const onDrop = useCallback(acceptedFiles => {if (RA.isNotEmpty(acceptedFiles)) {setGenesetFile(R.head(acceptedFiles))}}, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const {submitGsva, run, loading: loadingGSVA, submitted} = useSubmitGSVAMutation(runID)

  if (R.any(R.isNil, [run])) {
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
  
  const {secondaryRuns} = run


  return (
    <>
      <Message color='purple'>
        <Icon name='upload'/>
        Upload/replace geneset for this Run in the GMT format.
      </Message>
      <Segment inverted={success} color='purple'>
        {
        // disabledUpload ? 
        //   <Segment placeholder>
        //     <Header textAlign='center' content={'You do not have permissions to upload geneset for this run'} />
        //   </Segment>
        // :
          <div {...getRootProps()}>
          <Segment placeholder loading={loading}>
            <Header textAlign='center'
              content={R.isNil(genesetFile) ? 'Drag and drop a geneset.gmt file to run GSVA' : genesetFile.name}
            />
            {
              RA.isNotNil(genesetFile) &&
              <Button color='purple'
                onClick={() => uploadRunGeneset({variables: {geneset: genesetFile}}) && submitGsva()}
                content={success ? 'Uploaded' : 'Confirm'}
              />
            }
          </Segment>
          </div>
        }
      </Segment>
      <AnnotationsSecondaryRuns {...{secondaryRuns}} />
    </>
  )
}