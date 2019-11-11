import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const ShareProjectModal = withRedux(({
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
        <Button icon color='green' inverted labelPosition='left'>
          <Icon name='add user' />
          Share
        </Button>
      }
    >
      
      <Modal.Content>
        <Segment attached='top'>
          <Header icon='add user' content={projectName} subheader='Share this project with other users?' />
        </Segment>
        <Segment attached>
          <Divider content='Created by' horizontal />
          <Label content='Creator' />
          <Divider content='Shared with' horizontal />
          <Label.Group>
            <Label content='awd' />
            <Label content='awd' />
          </Label.Group>
        </Segment>
        <Segment attached='bottom'>
          <Grid>
            <Grid.Column width={12}>
              <Dropdown selection fluid search />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button fluid color='green' inverted icon='plus' />
            </Grid.Column>
          </Grid>
        </Segment>
      </Modal.Content>
    </Modal>
  )
})

export default ShareProjectModal