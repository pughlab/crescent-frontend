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
  setCurrentProjectID,
  setCurrentRunId
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
          onClick={() => {
            setCurrentProjectID(projectID)
            setCurrentRunId(null)
          }}
        />
      </Card.Content>
    </Card>
  )
}

const ProjectSelectModal = ({
  setCurrentRunId,
  currentProjectID, setCurrentProjectID,
  userID
}) => {
  const [projectType, setProjectType] = useState(null) // 'uploaded' || 'public' || 'curated'
  const isActiveProjectType = R.equals(projectType)

  // GQL query to find all projects of which user is a member of
  const {loading, data, error} = useQuery(gql`
    query UserProjects($userID: ID!) {
      uploadedProjects(userID: $userID) {
        projectID
        name
        description
        createdOn
        createdBy {
          name
        }
      }

      curatedProjects {
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

  const userProjects = R.ifElse(
      queryIsNotNil('uploadedProjects'),
      R.prop('uploadedProjects'),
      R.always([])
    )(data)

  const curatedProjects = R.ifElse(
      queryIsNotNil('curatedProjects'),
      R.prop('curatedProjects'),
      R.always([])
    )(data)

  console.log(curatedProjects, userProjects)
  return (
    <Modal size='fullscreen' dimmer='blurring' open={R.isNil(currentProjectID)}>
      <Modal.Header as={Header} textAlign='center' content="Projects" />
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
              {label: 'Your Data', key: 'uploaded'},
              {label: 'Example Data', key: 'public'},
              {label: 'Published Data', key: 'curated'}
            ]
          )
        }
        </Button.Group>
      </Modal.Header>
      <Modal.Content scrolling>
      {
        R.isNil(projectType) ?
          <Message>
            <Header>
              <Header.Content content='Click above to select a project type or below to create a new project' />
            </Header>
            <Message.List>
              <Message.Item content='Your Data: Upload your own scRNA-seq data for analysis and visualization' />
              <Message.Item content='Example Data: Examples of data formats accepted by CReSCENT' />
              <Message.Item content='Published Data: Select published, publicly available datasets to visualize' />
            </Message.List>
          </Message>
          :
          <Card.Group itemsPerRow={3}>
          {
            R.map(
              project => <ProjectCard key={R.prop('projectID', project)} {...{project, setCurrentProjectID, setCurrentRunId}} />,
              isActiveProjectType('uploaded') ? userProjects
              : isActiveProjectType('curated') ? curatedProjects
              : []
            )
          }
          </Card.Group>
      }
      </Modal.Content>
      <Modal.Actions>
        <NewProjectModal {...{setCurrentProjectID, userID, setCurrentRunId}} />
      </Modal.Actions>
    </Modal>
  )
}

export default ProjectSelectModal
