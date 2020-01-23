import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Input} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

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
          // console.log(event.target.files)
        }
      }
    />
  </>
  )
}

const ShareProjectModal = withRedux(({
  app: {
    user: {
      userID
    },
    project: {
      projectID,
      name: projectName
    },
  },
}) => {
  // objectName in the minio temporary bucket
  const [uploadedMetadataFile, setUploadedMetadataFile] = useState(null)
  console.log('uploaded', uploadedMetadataFile)
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
          <Header icon='add user' content={projectName} subheader='Upload/replace metadata file for this project?' />
        </Segment>
        <Segment attached='bottom' loading={false}>
          <Segment placeholder>
            <UploadButton
              label='Metadata'
              url='/express/upload/metadata' 
              setUploadedFile={setUploadedMetadataFile}
            />
          </Segment>
          <Button fluid content='Upload' />
        </Segment>
      </Modal.Content>
    </Modal>
  )
})

export default ShareProjectModal