import React, {useState, useEffect} from 'react';

import {Card, Popup, Segment, Button, Form, Modal, Label, Divider, Icon, Header, Input, Message} from 'semantic-ui-react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {queryIsNotNil} from '../../utils'

const NewProjectModal = ({
  setCurrentProjectID,
  userID
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  // GQL mutation to create a project
  const [createProject, {loading, data, error}] = useMutation(gql`
    mutation CreateProject($userID: ID!, $name: String!, $description: String!) {
      createProject(userID: $userID, name: $name, description: $description) {
        projectID
      }
    }
  `, {variables: {userID, name, description}})
  // On successful project creation, set currentProjectID
  useEffect(() => {
    if (queryIsNotNil('createProject', data)) {
      setCurrentProjectID(R.path(['createProject','projectID'], data))
    }
  }, [data])
  return (
    <>
      <Button content='New Project' onClick={() => setOpenModal(true)} />
      <Modal size='small' dimmer='blurring' open={openModal}>
        <Modal.Header as={Header} textAlign='center' content='New Project' />
        <Modal.Content>
          <Form>
            <Form.Input fluid
              placeholder='Enter a project name'
              onChange={(e, {value}) => {setName(value)}}
            />
            <Form.TextArea
              placeholder='Enter a short project description'
              onChange={(e, {value}) => {setDescription(value)}}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content='Cancel' onClick={() => setOpenModal(false)} />
          <Button
              color='black'
              basic={RA.isNilOrEmpty(name)}
              disabled={RA.isNilOrEmpty(name)}
              content='Create new project'
              onClick={() => createProject()}
            />
        </Modal.Actions>
      </Modal>
    </>
  )
}

export default NewProjectModal