import React, { useState, useEffect, useReducer } from 'react';

import { Container, Card, Divider, Popup, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Message } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'

import { useCrescentContext } from '../../../redux/hooks'
import { useProjectDetailsQuery } from '../../../apollo/hooks/project';
import { useDeleteMultipleRunsMutation } from '../../../apollo/hooks/run';
import { useArchiveProjectMutation } from '../../../apollo/hooks/project';


const ManageRunsModal = ({

}) => {
  const { userID: currentUserID, projectID } = useCrescentContext()
  //const project = useProjectDetailsQuery(projectID)
  const { deleteMultipleRuns, project } = useDeleteMultipleRunsMutation({projectID})
  const { archiveProject } = useArchiveProjectMutation({projectID})

  const initialManageRunsState = {
    selectedRunIDs: [],
    menuOpen: false,
    confirmRunsOpen: false,
    confirmProjectOpen: false
  }

  const [manageRunsState, manageRunsDispatch] = useReducer(
    (state, action) => {
      const { type } = action
      switch (type) {
        case 'RESET':
          return { ...state, selectedRunIDs: [] }
        case 'TOGGLE_RUN':
          const { runID } = action
          return R.evolve({
            selectedRunIDs: R.ifElse(
              R.includes(runID),
              R.without([runID]),
              R.append(runID)
            )
          }, state)
        default:
          return state
      }
    }, initialManageRunsState)

  const {
    selectedRunIDs
  } = manageRunsState

  if (R.isNil(project)) {
    return null
  }

  const {
    name: projectName,
    runs: allProjectRuns,
    createdBy: {
      userID: createdUserID
    }
  } = project

  const currentUserIsCreator = R.equals(currentUserID, createdUserID)
  const userCanDelete = run => R.or(currentUserIsCreator, R.equals(currentUserID, run.createdBy.userID))
  const deletableRuns = R.filter(userCanDelete, allProjectRuns)

  return (
    <Modal basic size='large' onClose={() => manageRunsDispatch({ type: 'RESET' })}
      trigger={
        <Button
          color='red'
          animated='vertical'
        >
          <Button.Content visible><Icon name='trash' /></Button.Content>
          <Button.Content hidden content='Manage project and runs' />
        </Button>
      }
    >
      <Modal.Content>
        <Segment attached='top'>
          <Header icon='trash' content={projectName} subheader='Manage the project runs?' />
        </Segment>

        {currentUserIsCreator &&
          <Segment attached>
            <Button color='red' fluid inverted content='Delete entire project' onClick={() => archiveProject()} />
            <Header content={'OR'} textAlign='center' />
          </Segment>
        }
        <Segment attached>
          <Header>
            <Header.Content>Select runs to delete</Header.Content>
            {!currentUserIsCreator && <Header.Subheader>Only runs created by you are available for you to delete.</Header.Subheader>}
          </Header>
          {R.isEmpty(deletableRuns) ?
            <Segment placeholder>
              <Header icon>
                <Icon name='exclamation' />
                No Runs
              </Header>
            </Segment>
            :
            <Card.Group itemsPerRow={3}>
              {
                R.addIndex(R.map)((run, index) => {
                  const {
                    runID,
                    name,
                    createdOn,
                    createdBy: {
                      name: creatorName
                    }
                  } = run

                  console.log(runID, name)
                  const isSelectedToDelete = R.compose(
                    R.includes(runID),
                    R.prop('selectedRunIDs')
                  )(manageRunsState)

                  return (
                    <Card key={index} link
                      color={isSelectedToDelete ? 'red' : 'grey'}
                      onClick={() => manageRunsDispatch({ type: 'TOGGLE_RUN', runID })}
                    >
                      <Popup
                        size='large' wide='very'
                        trigger={
                          <Button attached='top' color={isSelectedToDelete ? 'red' : 'grey'}>
                            <Icon name={isSelectedToDelete ? 'file' : 'file outline'} size='large' />
                          </Button>
                        }
                      >
                        <Message>
                          <Message.Content>details here</Message.Content>
                        </Message>
                      </Popup>
                      <Card.Content extra>
                        <Header size='small'>
                          <Header.Content>
                            {name}
                          </Header.Content>
                        </Header>
                      </Card.Content>
                      <Card.Content>
                        <Label.Group>
                          <Label content={<Icon style={{ margin: 0 }} name='user' />} detail={creatorName} />
                          <Label content={<Icon style={{ margin: 0 }} name='calendar alternate outline' />} detail={moment(createdOn).format('DD MMM YYYY')} />
                        </Label.Group>
                      </Card.Content>
                    </Card>
                  )
                }, deletableRuns)
              }
            </Card.Group>}
        </Segment>
        <Segment attached='bottom'>
          <Button color='red' fluid inverted content='Delete selected runs' disabled={R.isEmpty(deletableRuns)} onClick={() => deleteMultipleRuns({ variables: { runIDs: selectedRunIDs } })} />
        </Segment>
      </Modal.Content>
    </Modal>
  )
}

export default ManageRunsModal
