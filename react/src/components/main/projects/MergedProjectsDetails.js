import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import moment from 'moment'
import filesize from 'filesize'

import withRedux from '../../../redux/hoc'

import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const ViewProjectModal = withRedux(({
  actions: {setProject},
  // Props
  name,
  projectID
}) => {
    // GQL query to find all projects of which user is a member of
  const {loading, data, error} = useQuery(gql`
    query ProjectDetails($projectID: ID) {
      project(projectID: $projectID) {
        projectID
        name
        kind
        description
        createdOn
        createdBy {
          name
          userID
        }
        
        runs {
          runID
          name
          status
        }

        externalUrls {
          link
          label
          type
        }

        mergedProjects {
          projectID
          name
        }

        datasetSize
      }
    }
  `, {
    fetchPolicy: 'network-only',
    variables: {projectID}
  })
  const project = R.ifElse(
    queryIsNotNil('project'),
    R.prop('project'),
    R.always(null)
  )(data)
  return (
    <Modal
      trigger={
        <Label as={Button}>
          {name}
        </Label>
      }
    >
      <Modal.Content>
        <Header icon textAlign='center'>
          <Icon name='folder open' />
          {name}
          <Header.Subheader>
          {
            R.ifElse(
              R.isNil,
              R.always(null),
              ({createdBy: {name}}) => <i>{`Created by ${name}`}</i>
            )(project)
          }
          </Header.Subheader>
          <Header.Subheader>
          {
            R.ifElse(
              R.isNil,
              R.always(null),
              R.prop('description')
            )(project)
          }
          </Header.Subheader>
        </Header>
        {
          RA.isNotNil(project) &&
          <Button fluid
            content='View this project'
            onClick={() => setProject(project)}
          />
        }
      </Modal.Content>
    </Modal>
  )
})

const MergedProjectsDetails = withRedux(({
  actions: {setProject},
  app: {
    user: {
      userID: currentUserID
    },
    project: {
      projectID,
      name: projectName,
      kind: projectKind,
      description,
      createdOn: projectCreatedOn,
      createdBy: {name: creatorName, userID: creatorUserID},
      mergedProjects
    },
    view: {
      isGuest
    }
  },
}) => { 
  return (
    RA.isNotNil(mergedProjects) &&
    RA.isNotEmpty(mergedProjects) &&
    <Segment attached>
      <Divider horizontal>
        <Header content={'Merged Projects'} />
      </Divider>
      <Label.Group size='large'>
      {
        R.compose(
          R.addIndex(R.map)(
            ({name, projectID}, index) => (
              <ViewProjectModal key={projectID} {...{name, projectID}} />
            )
          )
        )(mergedProjects)
      }
      </Label.Group>
    </Segment>
  )
})

export default MergedProjectsDetails