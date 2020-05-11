import React, {useState, useEffect} from 'react';

import {Container, Card, Divider, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Step, Transition} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useProjectDetailsQuery} from '../../../apollo/hooks'
import {useCrescentContext} from '../../../redux/hooks'
import {setProject} from '../../../redux/actions/context'

import {useDispatch} from 'react-redux'

const ViewProjectModal = ({
  projectID
}) => {
  const dispatch = useDispatch()
  const project = useProjectDetailsQuery(projectID)
  if (R.isNil(project)) {
    return null
  }
  const {name, createdBy: {name: creatorName}, description} = project
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
            <i>{`Created by ${creatorName}`}</i>
          </Header.Subheader>
          <Header.Subheader>
          {description}
          </Header.Subheader>
        </Header>
        {
          RA.isNotNil(project) &&
          <Button fluid
            content='View this project'
            onClick={() => dispatch(setProject({projectID}))}
          />
        }
      </Modal.Content>
    </Modal>
  )
}

const MergedProjectsDetails = ({

}) => { 
  const {projectID} = useCrescentContext()
  const project = useProjectDetailsQuery(projectID)
  if (R.isNil(project)) {
    return null
  }
  const {mergedProjects} = project
  return (
    <Segment attached>
      <Divider horizontal>
        <Header content={'Merged Projects'} />
      </Divider>
      <Label.Group size='large'>
      {
        R.map(
          ({projectID}) => (
            <ViewProjectModal key={projectID} {...{projectID}} />
          ),
          mergedProjects
        )
      }
      </Label.Group>
    </Segment>
  )
}

export default MergedProjectsDetails