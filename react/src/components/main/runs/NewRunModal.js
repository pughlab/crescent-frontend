import React, {useState, useEffect} from 'react';

import {Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const NewRunModal = withRedux(({
  app: {
    user: {userID},
    project: {projectID}
  },
  actions: {setRun},
  refetch
}) => {
  const [runName, setRunName] = useState('')
  const [createUnsubmittedRun, {loading, data, error}] = useMutation(gql`
    mutation CreateUnsubmittedRun($name: String!, $projectID: ID!, $userID: ID!) {
      createUnsubmittedRun(name: $name, projectID: $projectID, userID: $userID) {
        runID
        createdOn
        createdBy {
          userID
          name
        }
        name
        params
        status

        submittedOn
        completedOn
      }
    }
  `, {
    variables: {name: runName, projectID, userID},
    // Refetch runs on new created
    onCompleted: ({createUnsubmittedRun: newRun}) => {
      refetch()
      setRun(newRun)
    }
  })
  return (
    <Modal
      trigger={
        <Button fluid size='large'
          color='black'
          animated='vertical'
        >
          <Button.Content visible><Icon size='large' name='add'/></Button.Content>
          <Button.Content hidden content="Configure a pipeline and submit a run using this project's uploaded data"/>
        </Button>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Run' />
      <Modal.Content>
        <Form>
          <Form.Input fluid
            placeholder='Enter a Run Name'
            onChange={(e, {value}) => {setRunName(value)}}
          />
          <Form.Button fluid
            content='Create new run'
            onClick={() => createUnsubmittedRun()}
          />
        </Form>
      </Modal.Content>
    </Modal>
  )
})

export default NewRunModal