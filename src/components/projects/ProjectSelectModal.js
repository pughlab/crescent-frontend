import React, {useState, useEffect} from 'react';

import {Card, Popup, Segment, Button, Form, Modal, Label, Divider, Icon, Header, Input, Message} from 'semantic-ui-react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../utils'

import NewProjectModal from './NewProjectModal'

const ProjectCard = ({
  project: {
    projectID,
    name,
    description,
    createdBy: {name: creatorName},
    createdOn
  },
  setCurrentProjectID
}) => {
  return (
    <Card key={projectID} link>
      <Card.Content>
        <Card.Header content={name} />
        <Card.Meta content={`Created by ${creatorName} on ${moment(createdOn).format('D MMMM YYYY')}`} />
      </Card.Content>
      <Card.Content extra content={description} />
      <Card.Content extra>
        <Button fluid color='grey' icon='eye'
          onClick={() => setCurrentProjectID(projectID)}
        />
      </Card.Content>
    </Card>
  )
}

const ProjectSelectModal = ({
  currentProjectID, setCurrentProjectID,
  userID
}) => {
  const [projectType, setProjectType] = useState(null) // 'uploaded' || 'public' || 'curated'
  const isActiveProjectType = R.equals(projectType)

  // GQL query to find all projects of which user is a member of
  const {loading, data, error} = useQuery(gql`
    query UserProjects($userID: ID!) {
      projects(userID: $userID) {
        projectID
        name
        description
        createdOn
        createdBy {
          name
        }
      }
    }
  `, {
    variables: {userID},
    fetchPolicy: 'cache-and-network'
  })
  return (
    <Modal size='fullscreen' dimmer='blurring' open={R.isNil(currentProjectID)}>
      <Modal.Header as={Header} textAlign='center' content="Projects/Datasets" />
      <Modal.Header>
        <Button.Group fluid widths={3}>
        {
          R.map(
            ({label, key}) => (
              <Button key={key}
                color={isActiveProjectType(key) ? 'black' : null}
                content={label}
                active={isActiveProjectType(key)}
                onClick={() => setProjectType(key)}
              />
            ),
            [
              {label: 'Yours', key: 'uploaded'},
              {label: 'Example', key: 'public'},
              {label: 'Published', key: 'curated'}
            ]
          )
        }
        </Button.Group>
      </Modal.Header>
      <Modal.Content scrolling>
      {
        R.isNil(projectType) ?
          <Message>
            <Header
              textAlign='center'
              content='Click above to select a project type or below to create a new project'
            />
          </Message>
          :
          <Card.Group itemsPerRow={3}>
          {
            isActiveProjectType('uploaded') ?
              R.compose(
                R.map(project => <ProjectCard key={R.prop('projectID', project)} {...{project, setCurrentProjectID}} />),
                R.ifElse(
                  queryIsNotNil('projects'),
                  R.prop('projects'),
                  R.always([])
                )
              )(data)
              :
              []
          }
          </Card.Group>
      }
      </Modal.Content>
      <Modal.Actions>
        <NewProjectModal {...{setCurrentProjectID, userID}} />
      </Modal.Actions>
    </Modal>
  )
}

export default ProjectSelectModal
