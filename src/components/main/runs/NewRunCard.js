import React, {useState, useEffect} from 'react';

import {Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const NewRunCard = withRedux(({
  app: {
    project: {projectID}
  },
  actions: {
    setRun
  },
  // Prop
  refetch
}) => {
  const [runName, setRunName] = useState('')
  const [createUnsubmittedRun, {loading, data, error}] = useMutation(gql`
    mutation CreateUnsubmittedRun($name: String!, $projectID: ID!) {
      createUnsubmittedRun(name: $name, projectID: $projectID) {
        runID
        params
        name
      }
    }
  `, {
    variables: {name: runName, projectID},
    // Refetch runs on new created
    onCompleted: data => {refetch()}
  })
  return (
    <Modal
      trigger={
        <Card link color='black'>
          <Card.Content>
          <Card.Header as={Header}>
            <Icon name='add' circular />
            <Header.Content>
              Create New Run
            </Header.Content>
          </Card.Header>
          </Card.Content>
          <Card.Content extra content='Configure a pipeline and run on the cloud' />
        </Card>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Run' />
      <Modal.Content>
      {
        R.ifElse(
          queryIsNotNil('createUnsubmittedRun'),
          R.always(
            <Header icon textAlign='center'>
              <Icon name='check' />
              Run created! Click away to close
            </Header>
          ),
          R.always(
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
          )
        )(data)
      }
      </Modal.Content>
    </Modal>
  )
})

export default NewRunCard