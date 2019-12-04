import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import moment from 'moment'

import withRedux from '../../../redux/hoc'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

import RunCard from './RunCard'
import NewRunModal from './NewRunModal'

import ArchiveProjectModal from '../projects/ArchiveProjectModal'
import ShareProjectModal from '../projects/ShareProjectModal'

const RunsStatusLegend = ({
  projectRuns
}) => {
  const {pending: pendingCount, submitted: submittedCount, completed: completedCount} = R.reduce(
    (runCountsByStatus, {status}) => R.over(R.lensProp(status), R.inc, runCountsByStatus),
    {pending: 0, submitted: 0, completed: 0},
    projectRuns
  )
  return (
    <Step.Group fluid widths={3}>
      <Step>
        <Icon name='circle outline' color='orange'/>
        <Step.Content>
          <Step.Title>{pendingCount} Pending User Submission</Step.Title>
          <Step.Description>Runs you still need to configure and submit</Step.Description>
        </Step.Content>
      </Step>
      <Step>
        <Icon name='circle notch' color='yellow'/>
        <Step.Content>
          <Step.Title>{submittedCount} Submitted And Running</Step.Title>
          <Step.Description>Runs being computed on the cloud</Step.Description>
        </Step.Content>
      </Step>
      <Step>
        <Icon name='circle outline check' color='green'/>
        <Step.Content>
          <Step.Title>{completedCount} Completed</Step.Title>
          <Step.Description>Runs completed</Step.Description>
        </Step.Content>
      </Step>
    </Step.Group>
  )
}

const RunsCardList = withRedux(({
  app: {
    project: {
      projectID,
      name: projectName,
      description,
      createdOn: projectCreatedOn,
      createdBy: {name: creatorName}
    },
  },
  actions: {setProject},
}) => {
  const {loading, data, error, refetch} = useQuery(gql`
    query ProjectRuns($projectID: ID) {
      runs(projectID: $projectID) {
        runID
        createdOn
        createdBy {
          name
        }
        name
        params
        status
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
      <Divider horizontal content='Project Details' />
      <Segment attached='top'>
        <Header
          content={projectName}
          subheader={`Created by ${creatorName} on ${moment(projectCreatedOn).format('D MMMM YYYY')}`}
        />
        <Divider horizontal />
        {description}
      </Segment>
      {/* ADD USERS TO PROJECT OR ARCHIVE PROJECT */}
      <Button.Group attached widths={2}>
        <ShareProjectModal />
        <ArchiveProjectModal />
      </Button.Group>
      <Segment attached='bottom'>
        <Divider horizontal content={`Viewing ${R.length(projectRuns)} Project Run${R.compose(R.equals(1), R.length)(projectRuns) ? '' : 's'} Below`} />
        <RunsStatusLegend {...{projectRuns}} />
        {/* CREATE NEW RUN FOR PROJECT */}
        <NewRunModal {...{refetch}} />
        {/* LIST OF EXISTING RUNS FOR PROJECT */}
        <Segment attached='bottom'>
          {
            R.ifElse(
              R.isEmpty,
              R.always(
                <Segment placeholder>
                  <Header icon>
                    <Icon name='exclamation' />
                    No Runs
                  </Header>
                </Segment>
              ),
              projectRuns => (
                <Card.Group itemsPerRow={3}>
                {
                  R.map(
                    run => <RunCard key={R.prop('runID', run)} {...{run, refetch}} />,
                    projectRuns
                  )
                }
                </Card.Group>
              )
            )(projectRuns)
          }
        </Segment>
      </Segment>
    </Container>
  )
})

export default RunsCardList