import React, { useReducer, useEffect, useState } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { Button, Input, Form, Modal, Dropdown, Popup, Segment, Message, Header, Label } from 'semantic-ui-react'

import { useCrescentContext } from '../../redux/hooks'
import { useEditProjectDetailsMutation } from '../../apollo/hooks/project'

function useProjectDetails(projectID) {
  const {
    project: projectQuery,
    editProjectDescription, editProjectName,
    changeProjectOwnership,
    loading,
    dataDesc, dataName, dataOwner
  } = useEditProjectDetailsMutation({ projectID })

  const initialState = {
    project: null,
    form: { name: '', description: '', ownerID: '' },
    open: false,
    secondOpen: false
  }

  // hold all state (project data, form data, modal open) in reducer
  const [state, dispatch] = useReducer((state, action) => {
    const { type, payload={} } = action
    console.log(state, action)
    const reducer = {
      'resetForm': (payload, state) => {
        const {project: {name, description, createdBy: {userID: ownerID}}} = state
        return {...state, form: {name, description, ownerID}}
      },
      'updateFormName': ({ newName }, state) => ({ ...state, form: {...state.form, name: newName} }),
      'updateFormDescription': ({ newDescription }, state) => ({ ...state, form: { ...state.form, description: newDescription } }),
      'updateFormOwner': ({ newOwnerID }, state) => ({ ...state, form: { ...state.form, ownerID: newOwnerID } }),
      'setProjectData': ({project}, state) => {
        const {name, description, createdBy: {userID: ownerID}} = project
        return { ...state, project, form: { name, description, ownerID } }
      },
      'setOpen': ({open}, state) => ({ ...state, open }),
      'setSecondOpen': ({open: secondOpen}, state) => ({ ...state, secondOpen}),
      'mutateName': (payload, state) => {
        editProjectName({ variables: { newName: state.form.name } })
        return state
      },
      'mutateDesc': (payload, state) => {
        editProjectDescription({ variables: { newDescription: state.form.description } })
        return state
      },
      'mutateOwner': (payload, state) => {
        changeProjectOwnership({ variables: { newOwnerID: state.form.ownerID, oldOwnerID: state.project.createdBy.userID } })
        return state
      },
    }

    return R.has(type, reducer) ? reducer[type](payload, state) : state
  }, initialState)

  //useEffect to listen for projectQuery to be non-null (to setProjectData)
  useEffect(() => {
    if (RA.isNotNil(projectQuery)) {
      console.log(projectQuery)
      dispatch({ type: 'setProjectData', payload: { project: projectQuery } })
    }
  }, [projectQuery])

  // when modal is open, set new name, description, owner to match the old ones
  useEffect(() => {
    if (state.open) {
      dispatch({ type: 'resetForm' })
    }
  }, [state.open])

  // close Modal when mutation successful
  useEffect(() => {
    if (R.any(RA.isTrue, [RA.isNotNil(dataDesc), RA.isNotNil(dataName), RA.isNotNil(dataOwner)])) {
      dispatch({ type: 'setOpen', payload: { open: false } })
      dispatch({ type: 'setSecondOpen', payload: { open: false } })
    }
  }, [dataDesc, dataName, dataOwner])

  return { state, dispatch, loading }
}

const ProjectHeader = ({

}) => {
  const { projectID, userID: currentUserID } = useCrescentContext()
  const { state, dispatch, loading } = useProjectDetails(projectID)
  if (R.isNil(state.project)) {
    return null
  }

  const {
    project: {
      name: oldName,
      description: oldDescription,
      createdBy: {
        userID: createdUserID,
        name: oldOwnerName
      },
      sharedWith
    },
    form: {
      name: newName,
      description: newDescription,
      ownerID: newOwnerID
    },
    open,
    secondOpen
  } = state

  const isProjectCreatorID = R.equals(createdUserID)
  const sameName = R.equals(oldName, newName)
  const sameDesc = R.equals(oldDescription, newDescription)
  const sameOwner = isProjectCreatorID(newOwnerID)
  const disabled = R.or(loading, RA.allEqualTo(true, [sameName, sameDesc, sameOwner])) // disable button when loading or unchanged description/name/owner
  const currentUserIsCreator = isProjectCreatorID(currentUserID)
  const notShared = R.isEmpty(sharedWith)

  // call dispatch with appropriate action(s) after Save is clicked
  const submitButtonHandler = () => {
    if (!sameName) { dispatch({ type: 'mutateName' }) }
    if (!sameDesc) { dispatch({ type: 'mutateDesc' }) }
    if (!sameOwner) { dispatch({ type: 'mutateOwner' }) }
  }

  return (
    currentUserIsCreator ? (
      <>
        <Modal basic open={open} onOpen={() => dispatch({ type: 'setOpen', payload: { open: true } })} onClose={() => dispatch({ type: 'setOpen', payload: { open: false } })}
          trigger={
            <Label as={Button} basic >
              <Header textAlign="center">{oldName}</Header>
            </Label>
          }
        >
          <Modal.Content>
            <Segment.Group>
              <Segment attatched='top' >
                <Header icon='edit' content={oldName} subheader='Edit the details of this project?' />
              </Segment >
              <Segment attatched='top bottom'>
                <Header as='h4'>Project Name</Header>
                <Input fluid value={newName} onChange={(e, { value }) => { dispatch({ type: 'updateFormName', payload: { newName: value } }) }} />
                <Header as='h4'>Project Description</Header>
                <Form>
                  <Form.TextArea
                    value={newDescription}
                    onChange={(e, { value }) => { dispatch({ type: 'updateFormDescription', payload: { newDescription: value } }) }}
                  />
                </Form>
                <Header as='h4'>
                  <Header.Content>
                    Project Owner
                    {notShared &&
                      <Header.Subheader>This project is not shared with any other users.</Header.Subheader>
                    }
                  </Header.Content>
                </Header>
                {!notShared &&
                  <Dropdown
                    placeholder='Select a User'
                    fluid
                    selection
                    onChange={(e, { value }) => {
                      dispatch({ type: 'updateFormOwner', payload: { newOwnerID: value } })
                    }}
                    options={
                      R.map(
                        ({ name, userID }) => ({
                          key: userID,
                          value: userID,
                          text: name
                        }),
                        sharedWith
                      )
                    } />
                }
              </Segment>
              <Segment attatched='bottom'>
                <Button color='black' disabled={disabled} loading={loading} fluid content='Save' onClick={() => dispatch({ type: 'setSecondOpen', payload: { open: true } })} />
              </Segment>
            </Segment.Group>
          </Modal.Content>
        </Modal>
        <Modal onClose={() => dispatch({ type: 'setSecondOpen', payload: { open: false } })}
          open={secondOpen}>
          <Modal.Header>Confirm project details</Modal.Header>
          <Modal.Content>
            <Header as='h4' content="Name" />
            <p>{sameName ? oldName : newName}</p>
            <Header as='h4' content="Description" />
            <p>{sameDesc ? oldDescription : newDescription}</p>
            <Header as='h4' content="Owner" />
            <p>
              {sameOwner ?
                oldOwnerName
                :
                R.compose(
                  R.prop('name'),
                  R.find(R.propEq('userID', newOwnerID))
                )(sharedWith)
              }
            </p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              icon='x' content='Cancel' onClick={() => dispatch({ type: 'setSecondOpen', payload: { open: false } })} />
            <Button
              icon='check' color='black' content='Confirm' onClick={() => submitButtonHandler()} />
          </Modal.Actions>
        </Modal>
      </>
    ) : (
      <Header textAlign="center">{oldName}</Header>
    )

  )
}

export default ProjectHeader
