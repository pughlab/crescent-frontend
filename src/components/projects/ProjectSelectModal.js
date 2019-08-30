import React, {useState, useEffect} from 'react';

import {Card, Popup, Segment, Button, Grid, Modal, Label, Divider, Icon, Header, Input, Message} from 'semantic-ui-react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ProjectCard = ({
  project: {
    projectID,
    name
  },
  setCurrentProjectID
}) => {
  return (
    <Card key={projectID} link>
      <Card.Content>
        <Card.Header content={name} />
      </Card.Content>
      <Card.Content extra>
        <Button fluid
          color='grey'
          icon='eye'
          onClick={() => {
            console.log('selected project', projectID)
            setCurrentProjectID(projectID)
          }}
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
  const {loading: queryLoading, data: projectsData} = useQuery(gql`
    query UserProjects($userID: ID!) {
      projects(userID: $userID) {
        projectID
        name
      }
    }
  `, {
    variables: {userID},
    fetchPolicy: 'cache-and-network'
  })
  // console.log(projectsData, 'projects')

  const [newProjectName, setNewProjectName] = useState(null)
  // GQL mutation to create a project
  const [createProject, {loading, data, error}] = useMutation(gql`
    mutation CreateProject($userID: ID!, $name: String!) {
      createProject(userID: $userID, name: $name) {
        projectID
      }
    }
  `, {variables: {userID, name: newProjectName}})
  // On successful project creation, set currentProjectID
  useEffect(() => {
    if (
      R.both(
        RA.isNotNilOrEmpty,
        R.propSatisfies(RA.isNotNil, 'createProject')
      )(data)
    ) {
      setCurrentProjectID(R.path(['createProject','projectID'], data))
    }
  }, [data])
  return (
    <Modal size='fullscreen' dimmer='blurring'
      open={R.isNil(currentProjectID)}
    >
      <Modal.Header as={Header} textAlign='center' content="Projects/Datasets" />
      <Modal.Header>
        <Button.Group fluid widths={3}>
        {
          R.map(
            ({label, key}) => (
              <Button key={key}
                color={isActiveProjectType(key) ? 'grey' : null}
                content={label}
                active={isActiveProjectType(key)}
                onClick={() => setProjectType(key)}
              />
            ),
            [
              {label: 'Uploaded', key: 'uploaded'},
              {label: 'Public', key: 'public'},
              {label: 'Curated', key: 'curated'}
            ]
          )
        }
        </Button.Group>
      </Modal.Header>
      <Modal.Content scrolling>
      {
        isActiveProjectType('uploaded') &&
        <>
          <Input fluid
            action={
              <Button
                disabled={RA.isNilOrEmpty(newProjectName)}
                content='Create new project'
                onClick={() => {
                  console.log('create project', newProjectName)
                  createProject()
                }}
              />
            }
            placeholder='Enter a project name'
            onChange={(e, {value}) => {setNewProjectName(value)}}
          />
          <Divider />
        </>
      }
      {
        R.isNil(projectType) ?
        <Segment placeholder>
          <Header textAlign='center' content='Click above to select a project type' />
        </Segment>
        :
        <Card.Group itemsPerRow={3}>
        {
          isActiveProjectType('uploaded') ?
            R.compose(
              R.map(project => <ProjectCard key={R.prop('projectID', project)} {...{project, setCurrentProjectID}} />),
              R.ifElse(
                R.both(RA.isNotNilOrEmpty, R.propSatisfies(RA.isNotNil, 'projects')),
                R.prop('projects'),
                R.always([])
              )
            )(projectsData)
            :
            []
        }
        </Card.Group>
      }
      </Modal.Content>
      <Modal.Actions>

      </Modal.Actions>
    </Modal>
  )
}

export default ProjectSelectModal
