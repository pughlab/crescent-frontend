import React, { useEffect, useReducer, useState } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Header, Popup, Message, Label, Form, Divider, Modal, Button, Segment, Input, Icon } from 'semantic-ui-react'

import { useCrescentContext } from '../../redux/hooks'
import { useEditRunDetailsMutation } from '../../apollo/hooks/run'

import { useCellCountsQuery } from '../../apollo/hooks/results'
import moment from 'moment'

function useRunDetails(runID) {
  const {
    run: runQuery,
    editRunDescription,
    editRunName,
    loading,
    dataDesc,
    dataName
  } = useEditRunDetailsMutation({ runID })

  const [state, dispatch] = useReducer((state, action) => {
    const { type, payload } = action
    if (type === 'resetForm') {
      const form = { name: state.run.name, description: state.run.description }
      return { ...state, form }
    } else if (type === 'updateFormName') {
      const { newName } = payload
      const form = { ...state.form, name: newName }
      return { ...state, form }
    } else if (type === 'updateFormDescription') {
      const { newDescription } = payload
      const form = { ...state.form, description: newDescription }
      return { ...state, form }
    } else if (type === 'setRunData') {
      const { run } = payload
      const { name, description } = run
      const form = { name, description }
      return { ...state, run, form }
    } else if (type === 'setOpen') {
      const { isOpen } = payload
      const open = isOpen
      return { ...state, open }
    } else if (type === 'mutateName') {
      editRunName({ variables: { newName: state.form.name } })
      return state
    } else if (type === 'mutateDesc') {
      editRunDescription({ variables: { newDescription: state.form.description } })
      return state
    } else {
      return state
    }
  }, {
    run: null,
    form: { name: '', description: '' },
    open: false
  })

  //useEffect to listen for runQuery to be non-null (to setRunData)
  useEffect(() => {
    if (RA.isNotNil(runQuery)) {
      dispatch({ type: 'setRunData', payload: { run: runQuery } })
    }
  }, [runQuery])

  // when modal is open, set new name, description to match the old ones
  useEffect(() => {
    if (state.open) {
      dispatch({ type: 'resetForm' })
    }
  }, [state.open])

  // close Modal when mutation successful
  useEffect(() => {
    if (R.or(RA.isNotNil(dataDesc), RA.isNotNil(dataName))) {
      dispatch({ type: 'setOpen', payload: { isOpen: false } })
    }
  }, [dataDesc, dataName])

  return { state, dispatch, loading }
}


const RunHeader = () => {
  const { runID, userID: currentUserID } = useCrescentContext()
  const { state, dispatch, loading } = useRunDetails(runID)

  // using polling to get cellcount 
  const [isPolling, setIsPolling] = useState(false)
  
  const {cellcount, startCellCountsPolling, stopCellCountsPolling} = useCellCountsQuery(runID)

  useEffect(() => {
      if (R.equals('submitted')) {
        startCellCountsPolling(1000)
      }
  }, [dispatch, runID, startCellCountsPolling])

  useEffect(() => {
    if (RA.isNotNil(cellcount)) stopCellCountsPolling()
  }, [cellcount, isPolling, stopCellCountsPolling])

  if (R.isNil(state.run)) {
    return null
  }

  const {
    name: runName,
    description: runDescription,
    project: { name: projectName },
    createdOn,
    status,
    createdBy: {
      name: creatorName,
      userID: createdUserID
    },
    datasets //{datasetID, name, size, hasMetadata}
  } = state.run
  const color = R.prop(status, {
    pending: 'orange',
    submitted: 'yellow',
    completed: 'green',
    failed: 'red'
  })

  const currentUserIsCreator = R.equals(currentUserID, createdUserID)
  const sameName = R.equals(runName, state.form.name)
  const sameDesc = R.equals(runDescription, state.form.description)
  const disabled = R.or(loading, R.and(sameName, sameDesc)) // disable button when loading or unchanged description/name/owner
  const totalCells = R.sum(R.pluck('numCells')(datasets)) // calculating total raw cells

  // call dispatch with appropriate action(s) after Save is clicked
  const submitButtonHandler = () => {
    if (!sameName) { dispatch({ type: 'mutateName' }) }
    if (!sameDesc) { dispatch({ type: 'mutateDesc' }) }
  }

  return (
    <Modal
      basic
      open={state.open}
      onClose={() => dispatch({ type: 'setOpen', payload: { isOpen: false } })}
      onOpen={() => dispatch({ type: 'setOpen', payload: { isOpen: true } })}
      trigger={
        <Popup
          on='hover'
          trigger={
            currentUserIsCreator ? (
              <Label key={runName} as={Button} basic onClick={() => dispatch({ type: 'setOpen', payload: { isOpen: true } }) }>
                <Header textAlign="center">{projectName}
                  <Header.Subheader>{runName}</Header.Subheader>
                </Header>
              </Label>
            ) : (
              <Header textAlign='center' content={projectName} subheader={runName} />
            )
          }
          wide='very'
          position='bottom center'
        >
          <Message color={color}>
            <Message.Content>
              <Message.Header as={Header} textAlign='center'>
                Created by {creatorName} on {moment(createdOn).format('D MMMM YYYY, h:mm a')}
              </Message.Header>
              {
                R.and(RA.isNotEmpty(runDescription), RA.isNotNil(runDescription)) &&
                <>
                  <Divider horizontal content='Details' />
                  <p>{runDescription}</p>
                </>
              }
              <Divider horizontal content='Datasets' />
              <Label.Group>
                {
                  R.map(
                    ({ datasetID, name, cancerTag, size, hasMetadata, numCells }) => (
                      <Label key={datasetID}
                        color={R.prop(cancerTag, {
                          'cancer': 'pink',
                          'non-cancer': 'purple',
                          'immune': 'blue',
                        })}
                      >
                        {name}
                        {<Label.Detail content={R.toUpper(cancerTag)} />}
                        {<Label.Detail content={`${numCells} cells`}/>}
                      </Label>
                    ),
                    datasets
                  )
                }
              </Label.Group>
              <Divider horizontal content='Total Cells' />
              {<Label content={<Icon style={{ margin: 0 }} name='certificate' />} detail={`${totalCells} raw cells`} /> }
              {RA.isNotNil(cellcount) && <Label content={<Icon style={{ margin: 0 }} name='certificate' />} detail={`${cellcount} filtered cells`} /> }
            </Message.Content>
          </Message>
        </Popup>
      }
    >
      <Modal.Content>
        <Segment.Group>
          <Segment attatched='top' >
            <Header icon='edit' content={runName} subheader='Edit the details of this run?' />
          </Segment >
          <Segment attatched='top bottom'>
            <Header as='h4'>Run Name</Header>
            <Input fluid value={state.form.name} onChange={(e, { value }) => { dispatch({ type: 'updateFormName', payload: { newName: value } }) }} />
            <Header as='h4'>Run Description</Header>
            <Form>
              <Form.TextArea
                value={state.form.description}
                onChange={(e, { value }) => { dispatch({ type: 'updateFormDescription', payload: { newDescription: value } }) }}
              />
            </Form>
          </Segment>
          <Segment attatched='bottom'>
            <Button color='black' disabled={disabled} loading={loading} fluid content='Save' onClick={submitButtonHandler} />
          </Segment>
        </Segment.Group>
      </Modal.Content>
    </Modal>
  )
}

export default RunHeader
