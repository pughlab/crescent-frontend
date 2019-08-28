import React, {useState, useEffect} from 'react';

import {Menu, Card, Popup, Segment, Button, Grid, Modal, Label, Divider, Icon, Header, Input} from 'semantic-ui-react'

import * as R from 'ramda'
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
  setCurrentProjectID
}) => {
  const [projectType, setProjectType] = useState('uploaded') // || 'public' || 'curated'
  const isActiveProjectType = R.equals(projectType)

  const [newProjectName, setNewProjectName] = useState(null) 
  return (
    <Modal size='fullscreen' dimmer='blurring' open={true}>
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
        <Card.Group itemsPerRow={4}>
        {
          R.map(
            project => <ProjectCard {...{project, setCurrentProjectID}} />,
            R.times(
              () => ({projectID: faker.random.uuid(), name: faker.random.word()}),
              20
            )
          )
        }
        </Card.Group>
      </Modal.Content>
      <Modal.Actions>
        <Input fluid
          action={
            <Button
              content='Create new project'
              onClick={() => console.log('create project', newProjectName)}
            />
          }
          placeholder='Enter a project name'
          onChange={(e, {value}) => {setNewProjectName(value)}}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default ProjectSelectModal
