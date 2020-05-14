import React, {useState} from 'react'

import {Button, Header, Icon, Modal, Segment} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext} from '../../../redux/hooks'

const UploadButton = ({
  label,   
  url, // Express url to upload temporary file
  setUploadedFile
}) => {
  const [loading, setLoading] = useState(false)
  const [localUploadedFile, setLocalUploadedFile] = useState(null)
  return (
  <>
    <Button fluid
      icon='upload'
      color={R.isNil(localUploadedFile) ? undefined : 'blue'}
      active={RA.isNotNil(localUploadedFile)}
      content={R.isNil(localUploadedFile) ? label : localUploadedFile.name}
      as={'label'}
      htmlFor={label}
      loading={loading}
    />
    <input hidden id={label} type='file'
      onChange={
        (event) => {
          setLoading(true)
          const file = R.head(event.target.files)
          // Send file to minio
          const xhr = new XMLHttpRequest ()
          xhr.open('PUT', url, true)
          // xhr.setRequestHeader('Access-Control-Allow-Origin', '*') 
          xhr.withCredentials = true
          const formData = new FormData()
          formData.append('uploadedFile', file)
          xhr.send(formData)
          // xhr.onprogress = () => {}
          xhr.onload = () => {
            if (xhr.status === 200) {
              const uploadID = JSON.parse(xhr.response)
              setUploadedFile(uploadID)
              setLocalUploadedFile(file)
              setLoading(false)
            }
          }
        }
      }
    />
  </>
  )
}

// TODO: GRAPHQL UPLOADS
const AddMetadataModal = ({
  project: {
    name: projectName
  }
}) => {
  const {projectID} = useCrescentContext()
  // Hacked for indicating that it has been uploaded
  const [uploadedStatus, setUploadedStatus] = useState(false)
  // objectName in the minio temporary bucket
  const [uploadedMetadataFile, setUploadedMetadataFile] = useState(null)
  return (
    <Modal basic size='small'
      trigger={
        <Button
          color='blue'
          animated='vertical'
        >
          <Button.Content visible><Icon name='upload'/></Button.Content>
          <Button.Content hidden content='Upload Metadata'/>
        </Button>
      }
    >
      <Modal.Content>
        <Segment attached='top'>
          <Header icon='upload' content={projectName} subheader='Upload/replace metadata file for this project?' />
        </Segment>
        <Segment attached='bottom' loading={false}>
          <Segment placeholder>
            <UploadButton
              label='Metadata'
              url='/express/upload/metadata' 
              setUploadedFile={setUploadedMetadataFile}
            />
          </Segment>
          <Button fluid
            content={uploadedStatus ? 'Uploaded and added to project' : 'Upload'}
            disabled={R.isNil(uploadedMetadataFile)}
            onClick={() => {
              const xhr = new XMLHttpRequest ()
              xhr.open('PUT', `/express/projects/${projectID}/metadata/${uploadedMetadataFile}`, true)
              xhr.withCredentials = true
              xhr.send()
              // xhr.onprogress = () => {}
              xhr.onload = () => {
                if (xhr.status === 200) {
                  setUploadedMetadataFile(null)
                  setUploadedStatus(true)
                }
              }
            }}
          />
        </Segment>
      </Modal.Content>
    </Modal>
  )
}

export default AddMetadataModal