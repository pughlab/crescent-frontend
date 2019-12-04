import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid} from 'semantic-ui-react'

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
        <Divider horizontal content='Viewing Project Runs Below' />
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
                  R.addIndex(R.map)(
                    (run, index) => <RunCard key={index} {...{run, refetch}} />,
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