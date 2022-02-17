import {useState, useCallback, useEffect} from 'react'
import {useActor} from '@xstate/react'
import {Button, Icon, Segment, Header, Message } from 'semantic-ui-react'
import {useDropzone} from 'react-dropzone'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useMachineServices, useCrescentContext} from '../../../../redux/hooks'
import {useSecondaryRunEvents} from '../../../../xstate/hooks'

import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

export default function UploadMetadataButton({runID}) {
  const {annotationsService: service} = useMachineServices()
  const {userID: currentUserID} = useCrescentContext()
  const {run} = useRunDetailsQuery(runID)
  const [metadataFile, setMetadataFile] = useState(null)
  const {uploadInput} = useSecondaryRunEvents()

  const onDrop = useCallback(acceptedFiles => {
    if (RA.isNotEmpty(acceptedFiles)) setMetadataFile(R.head(acceptedFiles))
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  const [{context: {inputsReady}, matches}] = useActor(service)
  const inputsPending = matches('inputsPending')
  const isStatus = status => R.both(RA.isNotNil, R.compose(
    R.equals(status),
    R.head
  ))(inputsReady)
  const [uploadLoading, uploadSuccess, uploadFailed] = R.map(isStatus, ['loading', 'success', 'failed'])

  useEffect(() => {
    if (inputsPending) setMetadataFile(null)
  }, [inputsPending])

  if (R.isNil(run)) return null

  const {createdBy: {userID: creatorUserID}} = run
  const disabledUpload = R.not(R.equals(currentUserID, creatorUserID))
  
  return (
    <Message color="purple">
      <Icon name="upload" />
      Upload/replace metadata for this run in this <a target="_blank" href="https://pughlab.github.io/crescent-frontend/#item-2-2">format</a>.
      <Segment
        color="purple"
        inverted={RA.isNotNil(metadataFile)}
      >
        { disabledUpload ? (
          <Segment placeholder>
            <Header
              content="You do not have permissions to upload metadata for this dataset"
              textAlign="center"
            />
          </Segment>
        ) : (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Segment placeholder loading={uploadLoading}>
              <Header
                content={R.isNil(metadataFile) ? 'Drag and drop a metadata.tsv file or click to select file' : metadataFile.name}
                textAlign="center"
              />
              { RA.isNotNil(metadataFile) && (
                <Button
                  color="purple"
                  content={R.toUpper(
                    uploadLoading ? 'Uploading' :
                    uploadFailed ? 'Upload failed, please try again' :
                    uploadSuccess ? 'Reupload' :
                    'Upload'
                  )}
                  onClick={e => {
                    e.stopPropagation()
                    uploadInput({
                      inputIndex: 0,
                      uploadOptions: {
                        variables: {
                          metadata: metadataFile
                        }
                      }
                    })
                  }}
                />
              )}
            </Segment>
          </div>
        )}
      </Segment>
    </Message>
  )
}