import React, {useState, useCallback, useEffect} from 'react'

import {Button, Header, Icon, Message, Segment} from 'semantic-ui-react'

import {useDropzone} from 'react-dropzone'

import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

// import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'

import {useUploadGenePosMutation} from '../../../../apollo/hooks/run'
import {useCrescentContext} from '../../../../redux/hooks'
import {useSampleAnnotsQuery, useSubmitInferCNVMutation} from '../../../../apollo/hooks/run'

export default function UploadGenePosButton({
  runID
}) {
  const {userID: currentUserID} = useCrescentContext()
  // const {run} = useRunDetailsQuery(runID)
  const {uploadGenePos, loading, success} = useUploadGenePosMutation({runID})
  const [genePosFile, setGenePosFile] = useState(null)
  useEffect(() => {if (success) setGenePosFile(null)}, [success])
  const onDrop = useCallback(acceptedFiles => {if (RA.isNotEmpty(acceptedFiles)) {setGenePosFile(R.head(acceptedFiles))}}, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  // const {submitGsva, run, loading: loadingGSVA, submitted} = useSubmitGSVAMutation(runID)
  const {submitInfercnv, run, loading: loadingInferCNV, submitted} = useSubmitInferCNVMutation(runID)   
  const sampleAnnots = useSampleAnnotsQuery(runID)

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

  
  const {normalCellTypes} = run
  // const disabledUpload = R.any(R.isNil, [normalCellTypes, sampleAnnots]) 



  return (
    <>
            <Message color='purple'>
              <Icon name='upload'/>
              Upload/replace gene/chromosome positions file in txt format.
            <Segment inverted={success} color='purple'>
              {
              // disabledUpload ? 
              //   <Segment placeholder>
              //     <Header textAlign='center' content={'Please upload a sample_annots.txt and select normal cell types'} />
              //   </Segment>
              // :
                <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Segment placeholder loading={loading}>
                  <Header textAlign='center'
                    content={R.isNil(genePosFile) ? 'Drag and drop a gene_pos.txt or click to select file' : genePosFile.name}
                  />
                  {
                    RA.isNotNil(genePosFile) &&
                    <Button color='purple'
                      // onClick={() => uploadRunGeneset({variables: {geneset: genesetFile}}) && submitGsva()}
                      onClick={() => uploadGenePos({variables: {genePos: genePosFile}}) && submitInfercnv()}
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