import React, {useState, useEffect} from 'react';

import {Card, Popup, Segment, Button, Grid, Modal, Label, Divider, Icon, Header, Input, Message} from 'semantic-ui-react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import faker from 'faker'

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
  console.log(userID)
  const [projectType, setProjectType] = useState(null) // 'uploaded' || 'public' || 'curated'
  const isActiveProjectType = R.equals(projectType)

  const [newProjectName, setNewProjectName] = useState(null)

  // GQL mutation to create a project
  const [createProject, {loading, data, error}] = useMutation(gql`
    mutation CreateProject($userID: ID!) {
      createProject(userID: $userID) {
        projectID
      }
    }
  `)
  // On successful project creation, set currentProjectID
  useEffect(() => {
    console.log(data)
    if (
      R.both(
        RA.isNotNilOrEmpty,
        R.propSatisfies(RA.isNotNil, 'createProject')
      )(data)
    ) {
      setCurrentProjectID(R.path(['createProject','projectID'], data))
    }
  }, [data])
  console.log('createProject', data)
  return (
    <Modal size='fullscreen' dimmer='blurring'
      open={R.isNil(currentProjectID)}
    >
      <Modal.Header as={Header} textAlign='center' content="Projects/Datasets" />
      <Modal.Content>
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
      </Modal.Content>
      <Modal.Content scrolling>
      {
        R.isNil(projectType) ?
        <Segment placeholder>
          <Header textAlign='center' content='Click above to select a project type' />
        </Segment>
        :
        <Card.Group itemsPerRow={3}>
        {
          R.map(
            project => <ProjectCard key={R.prop('projectID', project)} {...{project, setCurrentProjectID}} />,
            R.times(
              () => ({projectID: faker.random.uuid(), name: faker.random.word()}),
              20
            )
          )
        }
        </Card.Group>
      }
      </Modal.Content>
      <Modal.Actions>
      {
        isActiveProjectType('uploaded') &&
        <Input fluid
          action={
            <Button
              content='Create new project'
              onClick={() => {
                console.log('create project', newProjectName)
                createProject({variables: {userID}})
              }}
            />
          }
          placeholder='Enter a project name'
          onChange={(e, {value}) => {setNewProjectName(value)}}
        />
      }
      </Modal.Actions>
    </Modal>
  )
}

export default ProjectSelectModal
