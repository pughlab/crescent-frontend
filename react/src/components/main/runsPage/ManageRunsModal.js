import React, { useState, useEffect, useReducer } from 'react';

import { Container, Card, Divider, Popup, List, Button, Header, Icon, Modal, Dropdown, Label, Segment, Grid, Message } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import moment from 'moment'
import Marquee from 'react-marquee';

import { useCrescentContext } from '../../../redux/hooks'
import { useDeleteMultipleRunsMutation } from '../../../apollo/hooks/run';
import { useArchiveProjectMutation } from '../../../apollo/hooks/project';


const ManageRunsModal = ({

}) => {
  const { userID: currentUserID, projectID } = useCrescentContext()
  const { deleteMultipleRuns, project, dataRuns, loading: loadingRuns } = useDeleteMultipleRunsMutation({ projectID })
  const { archiveProject, dataProject, loading: loadingProject } = useArchiveProjectMutation({ projectID })

  const initialManageRunsState = {
    selectedRunIDs: [],
    menuOpen: false,
    confirmRunsOpen: false,
    confirmProjectOpen: false
  }

  const [manageRunsState, manageRunsDispatch] = useReducer(
    (state, action) => {
      const { type, payload } = action
      if (type === 'RESET') {
        return { ...state, selectedRunIDs: [] }
      } else if (type === 'TOGGLE_RUN') {
        const { runID } = action
        return R.evolve({
          selectedRunIDs: R.ifElse(
            R.includes(runID),
            R.without([runID]),
            R.append(runID)
          )
        }, state)
      } else if (type === 'SET_MENU_OPEN') {
        const { open } = payload
        return { ...state, menuOpen: open }
      } else if (type === 'SET_CONFIRM_RUNS_OPEN') {
        const { open } = payload
        return { ...state, confirmRunsOpen: open }
      } else if (type === 'SET_CONFIRM_PROJECT_OPEN') {
        const { open } = payload
        return { ...state, confirmProjectOpen: open }
      } else {
        return state
      }
    }, initialManageRunsState)

  const {
    selectedRunIDs,
    menuOpen,
    confirmRunsOpen,
    confirmProjectOpen
  } = manageRunsState

  // when menu modal is opened, reset the menu
  useEffect(() => {
    if (menuOpen) {
      manageRunsDispatch({ type: 'RESET' })
    }
  }, [menuOpen])

  // close Modal when mutation successful
  useEffect(() => {
    if (R.or(dataRuns, dataProject)) {
      manageRunsDispatch({ type: 'SET_MENU_OPEN', payload: { open: false } })
      manageRunsDispatch({ type: 'SET_CONFIRM_RUNS_OPEN', payload: { open: false } })
    }
  }, [dataRuns, dataProject])

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
  const isSelected = ({ runID }) => RA.contained(selectedRunIDs, runID)
  const selectedRuns = R.filter(isSelected, deletableRuns)

  return (
    <>
      <Modal basic size='large' open={menuOpen} onOpen={() => manageRunsDispatch({ type: 'SET_MENU_OPEN', payload: { open: true } })} onClose={() => manageRunsDispatch({ type: 'SET_MENU_OPEN', payload: { open: false } })}
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
        <Modal.Content scrolling>
          <Segment attached='top'>
            <Header icon='trash' content={projectName} subheader='Manage the project runs?' />
          </Segment>

          {currentUserIsCreator &&
            <Segment attached>
              <Button color='red' fluid inverted content='Delete entire project' onClick={() => manageRunsDispatch({ type: 'SET_CONFIRM_PROJECT_OPEN', payload: { open: true } })} />
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
                      runID, name, description,
                      parameters: {
                        quality,
                        normalization,
                        reduction,
                        clustering,
                        expression
                      },
                      createdBy: {
                        name: creatorName
                      },
                      status, hasResults, submittedOn, completedOn,
                      datasets
                    } = run

                    const isSelectedToDelete = R.compose(
                      R.includes(runID),
                      R.prop('selectedRunIDs')
                    )(manageRunsState)

                    const statusColor = R.prop(status, {
                      pending: 'orange',
                      submitted: 'yellow',
                      completed: 'green',
                      failed: 'red'
                    })

                    const parameterValues = R.compose(
                      R.unnest,
                      R.values,
                      R.map(R.toPairs)
                    )([normalization, reduction, clustering, expression])

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
                          <>
                            {
                              R.and(RA.isNotEmpty(description), RA.isNotNil(description)) &&
                              <Message size='mini'>
                                <Message.Content>
                                  <Divider horizontal content='Details' />
                                  {description}
                                </Message.Content>
                              </Message>
                            }
                            <Message>
                              <Message.Content>
                                <Divider horizontal content='Datasets' />
                                <Label.Group>
                                  {
                                    R.map(
                                      ({ datasetID, name, cancerTag }) => (
                                        <Label key={datasetID}
                                          color={R.prop(cancerTag, {
                                            true: 'pink',
                                            false: 'purple',
                                            null: 'blue',
                                          })}
                                        >
                                          {name}
                                          {<Label.Detail content={cancerTag ? 'CANCER' : R.equals(cancerTag, null) ? 'IMMUNE' : 'NON-CANCER'} />}
                                        </Label>
                                      ),
                                      datasets
                                    )
                                  }
                                </Label.Group>
                                <Divider horizontal content='Parameters' />
                                <Label.Group>
                                  {
                                    R.map(
                                      ([parameterKey, parameterValue]) => (
                                        <Label key={parameterKey} content={parameterKey} detail={parameterValue} />
                                      ),
                                      parameterValues
                                    )
                                  }
                                </Label.Group>
                              </Message.Content>
                            </Message>
                          </>
                        </Popup>

                        <Card.Content>
                          <Card.Header>
                            <Header size='small'>
                              <Marquee text={name} />
                            </Header>
                            <Label.Group>
                              <Label content={<Icon style={{ margin: 0 }} name='user' />} detail={creatorName} />
                              {
                                RA.isNotNil(submittedOn) &&
                                <Label content={<Icon style={{ margin: 0 }} name='calendar alternate outline' />} detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`} />
                              }
                              {
                                RA.isNotNil(submittedOn) &&
                                <Label content={<Icon style={{ margin: 0 }} name='clock' />} detail={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'minutes')} minutes`} />
                              }
                              {
                                <Label content={<Icon style={{ margin: 0 }} name='upload' />} detail={`${R.length(datasets)} dataset(s)`} />
                              }
                              {
                                hasResults &&
                                <Label content={<Icon style={{ margin: 0 }} name='exclamation circle' />} detail={'Results available'} />
                              }
                            </Label.Group>
                          </Card.Header>
                        </Card.Content>
                        <Card.Content>
                          <Label basic color={statusColor}>{R.toUpper(status)}</Label>
                        </Card.Content>
                      </Card>
                    )
                  }, deletableRuns)
                }
              </Card.Group>}
          </Segment>
          <Segment attached='bottom'>
            <Button color='red' fluid inverted content='Delete selected runs' disabled={R.isEmpty(selectedRunIDs)} onClick={() => manageRunsDispatch({ type: 'SET_CONFIRM_RUNS_OPEN', payload: { open: true } })} />
          </Segment>
        </Modal.Content>
      </Modal>
      <Modal open={confirmRunsOpen} onClose={() => manageRunsDispatch({ type: 'SET_CONFIRM_RUNS_OPEN', payload: { open: false } })}>
        <Segment.Group>
          <Segment attached='top'>
            <Header>Are you sure you want to delete the following runs?</Header>
          </Segment>
          <Segment attached>
            <List divided relaxed>
              {
                R.map(({ name, description, createdOn, runID, status }) => {
                  const statusColor = R.prop(status, {
                    pending: 'orange',
                    submitted: 'yellow',
                    completed: 'green',
                    failed: 'red'
                  })
                  return (
                  <List.Item key={runID}>
                    <List.Icon color={statusColor} name='file outline' size='large' verticalAlign='middle' />
                    <List.Content>
                      <List.Header>{name}</List.Header>
                      <List.Description>Created on {moment(createdOn).format('D MMMM YYYY')}</List.Description>
                    </List.Content>
                    <Marquee text={description} />
                  </List.Item>)
                })(selectedRuns)
              }
            </List>
          </Segment>
          <Segment attached='bottom'>
            <Button icon='check' fluid color='red' inverted content='Yes, delete these runs' disabled={loadingRuns} onClick={() => deleteMultipleRuns({ variables: { runIDs: selectedRunIDs } })} />
          </Segment>
        </Segment.Group>
      </Modal>
      <Modal open={confirmProjectOpen} onClose={() => manageRunsDispatch({ type: 'SET_CONFIRM_PROJECT_OPEN', payload: { open: false } })}>
        <Segment.Group>
          <Segment attached='top'>
            <Header>Are you sure you want to delete this project?</Header>
          </Segment>
          <Segment attached='bottom'>
            <Button icon='check' color='red' inverted fluid content='Yes, delete this project' disabled={loadingProject} onClick={() => archiveProject()} />
          </Segment>
        </Segment.Group>
      </Modal>
    </>
  )
}

export default ManageRunsModal
