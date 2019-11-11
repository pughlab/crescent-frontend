import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const ArchiveProjectModal = withRedux(({
  app: {
    project: {
      projectID,
      name: projectName
    },
  },
}) => {
  // const {loading, data, error, refetch} = useQuery(gql`
  //   query ProjectRuns($projectID: ID) {
  //     runs(projectID: $projectID) {
  //       runID
  //       name
  //       params
  //     }
  //   }
  // `, {
  //   fetchPolicy: 'cache-and-network',
  //   variables: {projectID}
  // })
  return (
    <Modal basic size='small'
      trigger={
        <Button color='red' inverted>
          <Icon name='trash' />
          Delete          
        </Button>
      }>
      <Modal.Content>
        <Segment attached='top'>
          <Header icon='trash' content={projectName} subheader='Are you sure you want to delete this project?' />
        </Segment>
        <Segment attached='bottom'>
        <Button fluid color='red' inverted 
          // onClick={() => setProject(null)}
        >
          <Icon name='checkmark' /> Yes
        </Button>
        </Segment>
      </Modal.Content>
    </Modal>
  )
})

export default ArchiveProjectModal