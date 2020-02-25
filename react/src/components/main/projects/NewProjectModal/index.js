import React, {useState, useCallback, useEffect} from 'react';

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import {queryIsNotNil} from '../../../../utils'

import {useDropzone} from 'react-dropzone'

import {Form, Card, Header, Menu, Button, Segment, Modal, Label, Divider, Icon, Image, Popup, Grid, Step} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import CreateProjectButton from './CreateProjectButton'

import DataForm from './DataForm'

const NewProjectModal = withRedux(({
  app: {user: {userID}},
  actions: {
    setProject
  },

  refetch
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [datasetDirectories, setDatasetDirectories] = useState([])
  const [existingDatasets, setExistingDatasets] = useState([])

  const [currentContent, setCurrentContent] = useState('details')
  const CONTENTS = [
    {
      name: 'details',
      label: 'Details',
      icon: 'info',
      component: (
        <Segment basic>
          <Form>
            <Form.Input fluid
              placeholder='Enter a project name'
              value={name}
              onChange={(e, {value}) => {setName(value)}}
            />
            <Form.TextArea
              placeholder='Enter a short project description'
              value={description}
              onChange={(e, {value}) => {setDescription(value)}}
            />
          </Form>
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
              existingDatasets, setExistingDatasets,
              datasetDirectories, setDatasetDirectories
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
              name, setName,
              description, setDescription,
              datasetDirectories, setDatasetDirectories,
              existingDatasets, setExistingDatasets,

              refetch
            }}
          />
        </Segment>
      )
    },
  ]
  const resetNewProjectModal = () => {
    setName('')
    setDescription('')
    setDatasetDirectories([])
    setExistingDatasets([])
    setCurrentContent('details')
  }
  
  return (
    <Modal
      size='large'
      onOpen={() => resetNewProjectModal()}
      trigger={
        <Button fluid size='large'
          color='black'
          animated='vertical'
        >
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
})

export default NewProjectModal