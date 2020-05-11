import React, {useState, useReducer} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {Transition, Header, Button, Segment, Modal, Icon, Step} from 'semantic-ui-react'

import CreateProjectButton from './CreateProjectButton'

import DataForm from './DataForm'
import DetailsForm from './DetailsForm'

const NewProjectModal = ({

}) => {
  const initialNewProjectState = {
    name: '',
    description: '',
    mergedProjectIDs: [],
    uploadedDatasetIDs: [],
  }
  const [newProjectState, newProjectDispatch] = useReducer(
    (state, action) => {
      const {type} = action
      switch (type) {
        case 'RESET':
          return initialNewProjectState
        case 'CHANGE_NAME':
          return R.evolve({
            name: R.always(R.prop('name', action))
          }, state)
        case 'CHANGE_DESCRIPTION':
          return R.evolve({
            description: R.always(R.prop('description', action))
          }, state)
        case 'TOGGLE_PROJECT':
          const {projectID} = action
          return R.evolve({
            mergedProjectIDs: R.ifElse(
              R.includes(projectID),
              R.without([projectID]),
              R.append(projectID)
            )
          }, state)
        case 'ADD_DATASET':
          return R.evolve({
            uploadedDatasetIDs: R.append(R.prop('datasetID', action))
          }, state)
        case 'REMOVE_DATASET':  
          return R.evolve({
            uploadedDatasetIDs: R.without(R.prop('datasetID', action))
          }, state)
        default: 
          return state
      }
    }, initialNewProjectState
  )

  const [currentContent, setCurrentContent] = useState('details')
  const CONTENTS = [
    {
      name: 'details',
      label: 'Details',
      icon: 'info',
      component: (
        <Segment basic>
          <DetailsForm
            {...{
              newProjectState,
              newProjectDispatch
            }}
          />
        </Segment>
      )
    },
    {
      name: 'data',
      label: 'Data',
      icon: 'database',
      component: (
        <Segment basic>
          <DataForm
            {...{
              newProjectState,
              newProjectDispatch
            }}
          />
        </Segment>
      )
    },
    {
      name: 'submit',
      label: 'Create Project',
      icon: 'paper plane',
      component: (
        <Segment basic>
          <CreateProjectButton
            {...{
              newProjectState,
              newProjectDispatch,
            }}
          />
        </Segment>
      )
    },
  ]

  return (
    <Modal
      size='large'
      onOpen={() => {
        newProjectDispatch({type: 'RESET'})
        setCurrentContent('details')
      }}
      trigger={
        <Button fluid size='large' color='black' animated='vertical'>
          <Button.Content visible><Icon name='add' size='large'/></Button.Content>
          <Button.Content hidden content="Upload your own files to create a new project"/>
        </Button>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Project' />
      <Modal.Header>
        <Step.Group fluid size='small' widths={4}>
        {
          R.map(
            ({name, label, icon}) => (
              <Step key={name} title={label} onClick={() => setCurrentContent(name)} icon={icon}
                active={R.equals(currentContent, name)}
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

export default NewProjectModal