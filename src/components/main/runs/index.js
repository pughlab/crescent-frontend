import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import moment from 'moment'
import filesize from 'filesize'

import withRedux from '../../../redux/hoc'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

import RunCard from './RunCard'
import NewRunModal from './NewRunModal'

import ArchiveProjectModal from '../projects/ArchiveProjectModal'
import ShareProjectModal from '../projects/ShareProjectModal'



const RunsStatusLegend = ({
  projectRuns,
  runsBySize,
  runFilter,
  setRunFilter
}) => {
  const {pending: pendingCount, submitted: submittedCount, completed: completedCount} = R.reduce(
    (runCountsByStatus, {status}) => R.over(R.lensProp(status), R.inc, runCountsByStatus),
    {pending: 0, submitted: 0, completed: 0},
    projectRuns
  )
  const totalCount = R.length(projectRuns)
  const totalSize = R.compose(
    R.sum,
    R.values
  )(runsBySize)

  return (
    <Step.Group fluid widths={4}>
      {
        R.compose(
          R.map(
            ({key, icon, color, title, description}) => (
              <Step key={key}
                active={R.equals(key, runFilter)}
                onClick={() => setRunFilter(key)}
              >
                <Icon name={icon} color={color}
                  loading={R.equals('pending', key)}
                />
                <Step.Content
                  title={title}
                  description={description}
                />
              </Step>
            )
          )    
        )([
          {
            key: 'all',
            icon: 'file',
            color: 'black',
            title: `${totalCount} Total`,
            description: `${filesize(totalSize)}`
          },
          {
            key: 'pending',
            icon: 'circle outline',
            color: 'orange',
            title: `${pendingCount} Pending`,
            description: 'To configure and submit'
          },
          {
            key: 'submitted',
            icon: 'circle notch',
            color: 'yellow',
            title: `${submittedCount} Submitted`,
            description: 'Computing on the cloud'
          },
          {
            key: 'completed',
            icon: 'circle outline check',
            color: 'green',
            title: `${completedCount} Completed`,
            description: 'Runs completed'
          }
        ])
      }
    </Step.Group>
  )
}

const RunsCardList = withRedux(({
  app: {
    project: {
      projectID,
      name: projectName,
      kind: projectKind,
      description,
      createdOn: projectCreatedOn,
      createdBy: {name: creatorName}
    },
    view: {
      isGuest
    }
  },
}) => {
  const {loading, data, error, refetch} = useQuery(gql`
    query ProjectRuns($projectID: ID) {
      runs(projectID: $projectID) {
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
    fetchPolicy: 'cache-and-network',
    variables: {projectID},
  })
  const projectRuns = R.ifElse(
    queryIsNotNil('runs'),
    R.prop('runs'),
    R.always([])
  )(data)
  const [runsBySize, setRunsBySize] = useState({})
  useEffect(() => {
    Promise.all(
      R.compose(
        R.map(runID => fetch(`size/${runID}`).then(res => res.json())),
        R.pluck('runID')
      )(projectRuns)
    ).then(
      R.compose(
        setRunsBySize,
        R.zipObj(R.pluck('runID', projectRuns)),
        R.pluck('size')
      )
    )
  }, [projectRuns])

  const [runFilter, setRunFilter] = useState('all')
  const isUploadedProject = R.equals('uploaded', projectKind)
  return (
    <Container>
      <Segment attached='top'>
        <Divider horizontal
          content={
            `${isUploadedProject ? 'User Uploaded' : 'Curated'} Project Details`
          }
        />
        <Header
          content={projectName}
          subheader={`Created by ${creatorName} on ${moment(projectCreatedOn).format('D MMMM YYYY')}`}
        />
        <Divider horizontal />
        {description}
      </Segment>
      {/* ADD USERS TO PROJECT OR ARCHIVE PROJECT ONLY IF NOT PUBLIC PROJECT*/}
      {
        isUploadedProject &&
          <Button.Group attached widths={2}>
            <ShareProjectModal />
            <ArchiveProjectModal />
          </Button.Group>
      }
      <Segment attached='bottom'>
        <Divider horizontal content={`Project Runs`} />
        {
          isUploadedProject &&
            <RunsStatusLegend {...{projectRuns, runsBySize, runFilter, setRunFilter}} />
        }
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
                    {`No Runs`}
                  </Header>
                </Segment>
              ),
              runs => (
                <>
                  <Card.Group itemsPerRow={3}>
                  <Transition.Group>
                  {
                    R.compose(
                      R.map(run => <RunCard key={R.prop('runID', run)} {...{run, refetch}} />),
                    )(runs)
                  }
                  </Transition.Group>
                  </Card.Group>
                </>
              )
            )(
              R.compose(
                R.reject(
                  R.compose(
                    R.and(R.equals('curated', projectKind)),
                    R.propEq('status', 'pending')
                  )
                ),
                R.filter(
                  R.compose(
                    R.or(R.equals('all', runFilter)),
                    R.propEq('status', runFilter)
                  )
                )
              )(projectRuns)
            )
          }
        </Segment>
      </Segment>
    </Container>
  )
})

export default RunsCardList