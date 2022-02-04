import React, {useState} from 'react';
import {Header, Button, Segment, Modal, Icon, Step} from 'semantic-ui-react'
import * as R from 'ramda'

import {useMachineServices} from '../../../../redux/hooks'

import {useNewProjectEvents, useNewProjectMachine} from '../../../../xstate/hooks'

import DetailsForm from './DetailsForm'
import DataForm from './DataForm'
import CreateProjectButton from './CreateProjectButton'

const NewProjectModalComponent = () => {
  const [currentContent, setCurrentContent] = useState('details')

  const {resetProject} = useNewProjectEvents()

  const CONTENTS = [
    {
      name: 'details',
      label: 'Details',
      icon: 'info',
      component: (
        <Segment basic>
          <DetailsForm />
        </Segment>
      )
    },
    {
      name: 'data',
      label: 'Data',
      icon: 'database',
      component: (
        <Segment basic>
          <DataForm />
        </Segment>
      )
    },
    {
      name: 'submit',
      label: 'Create Project',
      icon: 'paper plane',
      component: (
        <Segment basic>
          <CreateProjectButton />
        </Segment>
      )
    },
  ]

  return (
    <Modal
      closeIcon
      closeOnDimmerClick={false}
      onClose={() => {
        resetProject()
      }}
      onOpen={() => {
        setCurrentContent('details')
      }}
      size="large"
      trigger={
        <Button fluid size="large" color="black" animated="vertical">
          <Button.Content visible>
            <Icon name="add" size="large" />
          </Button.Content>
          <Button.Content hidden content="Upload your own files to create a new project" />
        </Button>
      }
    >
      <Modal.Header>
        <Header
          content="New Project"
          subheader="Enter project details and select/upload your data"
          textAlign="center"
        />
      </Modal.Header>
      <Modal.Header>
        <Step.Group fluid size="small" widths={4}>
          {
            R.map(
              ({name, label, icon}) => (
                <Step
                  key={name}
                  active={R.equals(currentContent, name)}
                  icon={icon}
                  onClick={() => setCurrentContent(name)}
                  title={label} 
                />
              ),
              CONTENTS
            )
          }
        </Step.Group>
      </Modal.Header>
      <Modal.Content scrolling>
        {
          R.compose(
            R.prop('component'),
            R.find(R.propEq('name', currentContent))
          )(CONTENTS)
        }
      </Modal.Content>
    </Modal>
  )
}

const NewProjectModal = () => {
  useNewProjectMachine()
  const {newProjectService} = useMachineServices()

  if (R.isNil(newProjectService)) return null

  return (
    <NewProjectModalComponent />
  )
}

export default NewProjectModal