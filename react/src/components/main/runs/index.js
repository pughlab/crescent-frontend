import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Popup, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

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
import AddMetadataModal from '../projects/AddMetadataModal'


const RunsStatusLegend = ({
  projectRuns,
  runsBySize,
  runFilter,
  setRunFilter
}) => {
  const {pending: pendingCount, submitted: submittedCount, completed: completedCount, failed: failedCount} = R.reduce(
    (runCountsByStatus, {status}) => R.over(R.lensProp(status), R.inc, runCountsByStatus),
    {pending: 0, submitted: 0, completed: 0, failed: 0},
    projectRuns
  )
  const totalCount = R.length(projectRuns)
  const totalSize = R.compose(
    R.sum,
    R.values
  )(runsBySize)

  return (
    <Step.Group fluid widths={5}>
      {
        R.compose(
          R.map(
            ({key, icon, color, title, description}) => (
              <Step key={key}
                active={R.equals(key, runFilter)}
                onClick={() => setRunFilter(key)}
              >
                <Icon name={icon} color={color}
                  loading={R.and(R.equals('submitted', key), R.not(R.equals(0, submittedCount)))}
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
            description: 'To Submit'
          },
          {
            key: 'submitted',
            icon: 'circle notch',
            color: 'yellow',
            title: `${submittedCount} Submitted`,
            description: 'Computing'
          },
          {
            key: 'completed',
            icon: 'circle outline check',
            color: 'green',
            title: `${completedCount} Completed`,
            description: 'Successfully'
          },
          {
            key: 'failed',
            icon: 'circle exclamation',
            color: 'red',
            title: `${failedCount} Failed`,
            description: 'Errored'
          }
        ])
      }
    </Step.Group>
  )
}

const RunsCardList = withRedux(({
  app: {
    user: {
      userID: currentUserID
    },
    project: {
      projectID,
      name: projectName,
      kind: projectKind,
      description,
      externalUrls,
      createdOn: projectCreatedOn,
      createdBy: {name: creatorName, userID: creatorUserID}
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
        R.map(runID => fetch(`/express/size/${runID}`).then(res => res.json())),
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
  const currentUserIsProjectCreator = R.equals(creatorUserID, currentUserID)

  // const filteredProjectRuns = R.compose(
  //   R.reject(
  //     R.compose(
  //       R.and(R.not(isUploadedProject)),
  //       R.propEq('status', 'pending')
  //     )
  //   ),
  //   R.filter(
  //     R.compose(
  //       R.or(R.equals('all', runFilter)),
  //       R.propEq('status', runFilter)
  //     )
  //   )
  // )(projectRuns)


  // filteredProjectRuns comments
  // if isUploadedProject, filter by status  
  // else if currentUserIsProjectCreator, hide public pending runs 
  // else hide public pending runs and only show currentUserID and creatorUserID public runs

  const filteredProjectRuns = R.compose(
    isUploadedProject ? R.filter(
      R.compose(
        R.or(R.equals('all', runFilter)),
        R.propEq('status', runFilter)
      )
    )
    :
    currentUserIsProjectCreator ? R.reject(
      R.propEq('status', 'pending')
    )
    : R.reject(R.anyPass([
        R.propEq('status', 'pending'),
        R.compose(
            R.not,
            R.either(
                R.pathEq(['createdBy', 'userID'], currentUserID),
                R.pathEq(['createdBy', 'userID'], creatorUserID)
            )
        )
    ]))
  )(projectRuns)

  return (
    <Container>
      <Segment attached='top'>
        <Divider horizontal>
          <Header content={`${isUploadedProject ? 'User Uploaded' : 'Curated'} Project Details`} />
        </Divider>
        <Header
          content={projectName}
          subheader={`Created by ${creatorName} on ${moment(projectCreatedOn).format('D MMMM YYYY')}`}
        />
        <Divider horizontal />
        {description}
        {
          RA.isNotEmpty(externalUrls) && 
          <>
          <Divider horizontal />
          {
            R.map(
              ({label, link, type}) => (
                <Popup key={label}
                  inverted
                  trigger={<Label as='a' href={link} icon={type} target="_blank" content={label}/>}
                  content={link}
                />
              ),
              externalUrls
            )
            }
          </>
        }
      </Segment>
      {/* ADD USERS TO PROJECT OR ARCHIVE PROJECT ONLY IF NOT PUBLIC PROJECT*/}
      {
        R.and(isUploadedProject, currentUserIsProjectCreator) && 
          <Button.Group attached widths={3}>
            <ShareProjectModal />
            <AddMetadataModal />
            <ArchiveProjectModal />
          </Button.Group>
      }
      <Segment attached='bottom'>
        <Divider horizontal>
          <Header content={'Project Runs'} subheader={'Please refresh the page to see latest updates to runs'} />
        </Divider>
        {
          isUploadedProject &&
            <RunsStatusLegend {...{projectRuns, runsBySize, runFilter, setRunFilter}} />
        }
        <NewRunModal {...{refetch}} />
        {/* LIST OF EXISTING RUNS FOR PROJECT */}
        {
          R.isEmpty(filteredProjectRuns) ?
            <Segment attached='bottom'>
              <Segment placeholder>
                <Header icon>
                  <Icon name='exclamation' />
                  {`No Runs`}
                </Header>
              </Segment>
            </Segment>
          :
            <Segment attached='bottom'>
              <Card.Group itemsPerRow={3}>
              {
                R.map(
                  run => <RunCard key={R.prop('runID', run)} {...{run, refetch}} />,
                  filteredProjectRuns
                )
              }
              </Card.Group>
            </Segment>
        }
      </Segment>
    </Container>
  )
})

export default RunsCardList