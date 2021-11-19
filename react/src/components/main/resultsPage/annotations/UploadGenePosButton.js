import React, {useState, useCallback, useEffect} from 'react'
import {Button, Header, Icon, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useUploadGenePosMutation} from '../../../../apollo/hooks/run'

export default function UploadGenePosButton({
  loadingInferCNV,
  normalCellTypes,
  runID,
  sampleAnnots,
  secondaryRunSubmitted,
  setNormalCellTypes,
  submitInferCNV
}) {
  // const {userID: currentUserID} = useCrescentContext()
  // const {run} = useRunDetailsQuery(runID)
  const {uploadGenePos, loading: loadingUpload, genePosUploaded} = useUploadGenePosMutation({runID})
  const [genePosFile, setGenePosFile] = useState(null)
  
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setGenePosFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const loading = loadingUpload || loadingInferCNV

  // const {status: runStatus, name: runName, createdBy: {userID: creatorUserID}} = run
  // const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))

  // const {normalCellTypes} = run
  // const disabledUpload = R.any(R.isNil, [normalCellTypes, sampleAnnots]) 

  useEffect(() => {
    if (secondaryRunSubmitted) setGenePosFile(null)
  }, [secondaryRunSubmitted])

  return (
    <Message color="purple">
      <Icon name="upload" />
      Upload/replace gene/chromosome positions file in txt format.
      <Segment
        color="purple"
        inverted={RA.isNotNil(genePosFile)}
      >
        {
          // disabledUpload ?
          //   <Segment placeholder>
          //     <Header textAlign='center' content={'Please upload a sample_annots.txt and select normal cell types'} />
          //   </Segment>
          // :
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Segment placeholder loading={loading}>
              <Header
                content={R.isNil(genePosFile) ? 'Drag and drop a gene_pos.txt or click to select file' : genePosFile.name}
                textAlign="center"
              />
              { RA.isNotNil(genePosFile) && (
                <Button
                  color="purple"
                  content={R.toUpper(
                    loadingUpload ? 'Uploading' : // During gene position file upload
                    R.both(RA.isNotNil, R.not)(genePosUploaded) ? 'Upload failed, please try again' : // On gene position upload failure
                    loadingInferCNV ? 'Submitting' : // During inferCNV run submission
                    R.and(RA.isNotNil(genePosUploaded), R.isNil(sampleAnnots)) ? 'Add sample annotations file to submit InferCNV run' : // When no sample annotations file has been added
                    R.and(RA.isNotNil(genePosUploaded), RA.isEmptyArray(normalCellTypes)) ? 'Select one or more normal cell types to submit InferCNV run' : // When no normal cell types have been selected
                    genePosUploaded ? 'Submit' : // When the InferCNV run is ready to be submitted
                    'Confirm' // When the gene position file is ready to be uploaded
                  )}
                  disabled={
                    R.isNil(genePosFile) || // When no gene position file has been added
                    loading || // During gene position file upload
                    R.and(RA.isNotNil(genePosUploaded), R.isNil(sampleAnnots)) || // When no sample annotations file has been added
                    R.and(RA.isNotNil(genePosUploaded), RA.isEmptyArray(normalCellTypes)) // When no normal cell types have been selected
                  }
                  onClick={async e => {
                    e.stopPropagation()
                    
                    if (!genePosUploaded) await uploadGenePos({variables: {genePos: genePosFile}})
                    // Only submit the InferCNV run if a sample annotations file has been added and if one or more normal cell types have been selected
                    if (RA.isNotNil(sampleAnnots) && RA.isNonEmptyArray(normalCellTypes)) {
                      const {data: {submitInfercnv}} = await submitInferCNV()

                      if (RA.isNotNil(submitInfercnv)) setNormalCellTypes([])
                    }
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