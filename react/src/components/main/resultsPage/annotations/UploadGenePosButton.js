import React, {useState, useCallback, useEffect} from 'react'
import {useActor} from '@xstate/react'
import {Button, Header, Icon, Message, Segment} from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as RA from 'ramda-adjunct'
import * as R from 'ramda'

import {useAnnotations} from '../../../../redux/hooks'

export default function UploadGenePosButton() {
  // const {userID: currentUserID} = useCrescentContext()
  // const {run} = useRunDetailsQuery(runID)
  const {annotationsService: service} = useAnnotations()
  const [genePosFile, setGenePosFile] = useState(null)
  
  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setGenePosFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const inputIndex = 2

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
            <Segment placeholder loading={uploadLoading}>
              <Header
                content={R.isNil(genePosFile) ? 'Drag and drop a gene_pos.txt or click to select file' : genePosFile.name}
                textAlign="center"
              />
              { RA.isNotNil(genePosFile) && (
                <Button
                  color="purple"
                  content={R.toUpper(
                    uploadLoading ? 'Uploading' :
                    uploadFailed ? 'Upload failed, please try again' :
                    uploadSuccess ? 'Reupload' :
                    'Upload'
                  )}
                  disabled={uploadLoading}
                  onClick={e => {
                    e.stopPropagation()
                    send({
                      type: 'UPLOAD_INPUT',
                      inputIndex,
                      uploadOptions: {
                        variables: {
                          genePos: genePosFile
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