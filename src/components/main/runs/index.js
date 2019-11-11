import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

import RunCard from './RunCard'
import NewRunCard from './NewRunCard'

const RunsCardList = withRedux(({
  app: {
    project: {
      projectID,
      name: projectName
    },
  },
  actions: {setProject},
}) => {
  const {loading, data, error, refetch} = useQuery(gql`
    query ProjectRuns($projectID: ID) {
      runs(projectID: $projectID) {
        runID
        name
        params
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
    variables: {projectID}
  })
  const projectRuns = R.ifElse(
    queryIsNotNil('runs'),
    R.prop('runs'),
    R.always([])
  )(data)
  console.log(data)
  return (
    <Container>
      <Button.Group size='large' fluid widths={2}>
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

        <Modal basic size='small'
          trigger={
            <Button icon color='red' inverted labelPosition='right'>
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
      </Button.Group>
      <Divider content='Viewing Runs' horizontal/>
      <Card.Group itemsPerRow={3} style={{maxHeight: '75vh', overflowY: 'scroll'}}>
        <NewRunCard {...{refetch}} />
      {
        R.addIndex(R.map)(
          (run, index) => <RunCard key={index} {...{run}} />,
          projectRuns
        )
      }
      </Card.Group>
    </Container>
  )
})

export default RunsCardList