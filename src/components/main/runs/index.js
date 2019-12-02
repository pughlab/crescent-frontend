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
import NewRunCard from './NewRunCard'

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
        completed
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
      <Segment attached='top'>
        <Header
          content={projectName}
          subheader={`Created by ${creatorName} on ${moment(projectCreatedOn).format('D MMMM YYYY')}`}
        />
        <Divider horizontal />
        {description}
      </Segment>
      <Button.Group attached='bottom' widths={2}>
        <ShareProjectModal />
        <ArchiveProjectModal />
      </Button.Group>
      <Divider hidden horizontal />
      <Card.Group itemsPerRow={3} style={{maxHeight: '65vh', overflowY: 'scroll'}}>
        <NewRunCard {...{refetch}} />
      {
        R.addIndex(R.map)(
          (run, index) => <RunCard key={index} {...{run, refetch}} />,
          projectRuns
        )
      }
      </Card.Group>
    </Container>
  )
})

export default RunsCardList