import React, { useReducer, useEffect } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { Button, Input, Form, Modal, Segment, Header, Label } from 'semantic-ui-react'

import { useCrescentContext } from '../../redux/hooks'
import { useProjectDetailsQuery } from '../../apollo/hooks/project'
import { useEditProjectDetailsMutation } from '../../apollo/hooks/project'


//Example of custom hook
function useProjectDetails(projectID) {
  //const projectQuery = useProjectDetailsQuery(projectID) //query data from import { compose, graphql } from 'react-apollo'
  const { project: projectQuery, editProjectDescription, editProjectName, loading, dataDesc, dataName } = useEditProjectDetailsMutation({ projectID })

  // hold all state (project data, form data, modal open) in reducer
  const [state, dispatch] = useReducer((state, action) => {
    const { type, payload } = action
    if (type === 'resetForm') {
      const form = { name: state.project.name, description: state.project.description }
      return { ...state, form }
    } else if (type === 'updateFormName') {
      const { newName } = payload
      const form = { ...state.form, name: newName }
      return { ...state, form }
    } else if (type === 'updateFormDescription') {
      const { newDescription } = payload
      const form = { ...state.form, description: newDescription }
      return { ...state, form }
    } else if (type === 'setProjectData') {
      const { project } = payload
      const { name, description } = project
      const form = { name, description }
      return { ...state, project, form }
    } else if (type === 'setOpen') {
      const { isOpen } = payload
      const open = isOpen
      return { ...state, open }
    } else {
      return state
    }
  }, {
    project: null,
    form: { name: '', description: '' },
    open: false
  })

  //useEffect to listen for projectQuery to be non-null (to setProjectData)
  useEffect(() => {
    if (RA.isNotNil(projectQuery)) {
      dispatch({ type: 'setProjectData', payload: { project: projectQuery } })
    }
  }, [projectQuery])

  // when modal is open, set new name and description to match the old ones
  useEffect(() => {
    if (state.open) {
      dispatch({ type: 'resetForm' })
    }
  }, [state.open])   

  // close Modal when mutation successful
  useEffect(() => { if (R.or(RA.isNotNil(dataDesc), RA.isNotNil(dataName))) { dispatch({ type: 'setOpen', payload: { isOpen: false } }) } }, [dataDesc, dataName]) 

  return { state, dispatch, loading, editProjectDescription, editProjectName } 
}

const ProjectHeader = ({

}) => {
  const { projectID } = useCrescentContext()
  const { state, dispatch, loading, editProjectDescription, editProjectName } = useProjectDetails(projectID)

  if (R.isNil(state.project)) {
    return null
  }
  const oldName = state.project.name
  const oldDesc = state.project.description
  const sameName = R.equals(oldName, state.form.name)
  const sameDesc = R.equals(oldDesc, state.form.description)
  const disabled = R.or(loading, R.and(sameName, sameDesc)) // disable button when loading or unchanged description/name

  // call appropriate mutate functions
  const submitButtonHandler = () => {
    if (!sameName) { editProjectName({ variables: { newName: state.form.name } }) }
    if (!sameDesc) { editProjectDescription({ variables: { newDescription: state.form.description } }) }
  }
  return (
    <Modal basic open={state.open} onOpen={() => dispatch({ type: 'setOpen', payload: { isOpen: true } })} onClose={() => dispatch({ type: 'setOpen', payload: { isOpen: false } })}
      trigger={
        <Label as={Button} basic onClick={() => dispatch({ type: 'setOpen', payload: { isOpen: true } })}>
          <Header textAlign="center">{oldName}
          </Header>
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
            <Input fluid value={state.form.name} onChange={(e, { value }) => { dispatch({ type: 'updateFormName', payload: { newName: value } }) }} />
            <Header as='h4'>Project Description</Header>
            <Form>
              <Form.TextArea
                value={state.form.description}
                onChange={(e, { value }) => { dispatch({ type: 'updateFormDescription', payload: { newDescription: value } }) }}
              />
            </Form>
          </Segment>
          <Segment attatched='bottom'>
            <Button color='black' disabled={disabled} loading={loading} fluid content='Save' onClick={submitButtonHandler}/>
          </Segment>
        </Segment.Group>
      </Modal.Content>

    </Modal>
  )
}

export default ProjectHeader