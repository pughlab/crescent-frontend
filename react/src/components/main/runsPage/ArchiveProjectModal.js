import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {useDispatch} from 'react-redux'

import {useCrescentContext} from '../../../redux/hooks'
import {goBack} from '../../../redux/actions/context'

const ArchiveProjectModal = ({
  // Props
  project: {
    name: projectName
  }
}) => {
  const dispatch = useDispatch()
  const {projectID} = useCrescentContext()
  const [archiveProject, {loading, data, error}] = useMutation(gql`
    mutation ArchiveProject($projectID: ID) {
      archiveProject(projectID: $projectID) {
        projectID
        archived
      }
    }
  `, {
    variables: {projectID},
    onCompleted: data => {
      dispatch(goBack({comparePagePlots: null}))
    }
  })
  return (
    <Modal basic size='small'
      trigger={
        <Button
          color='red'
          animated='vertical'
        >
          <Button.Content visible><Icon name='trash'/></Button.Content>
          <Button.Content hidden content='Delete Project'/>
        </Button>
      }
    >
      <Modal.Content>
        <Segment attached='top'>
          <Header icon='trash' content={projectName} subheader='Are you sure you want to delete this project?' />
        </Segment>
        <Segment attached='bottom'>
        <Button fluid color='red' inverted 
          onClick={() => archiveProject()}
        >
          <Icon name='checkmark' />
          Yes, delete this project
        </Button>
        </Segment>
      </Modal.Content>
    </Modal>
  )
}

export default ArchiveProjectModal