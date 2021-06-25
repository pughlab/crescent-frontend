import React, { useState, useEffect, useReducer } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Header, Popup, Message, Label, Form, Divider, Modal, Button, Segment, Input } from 'semantic-ui-react'

import { useCrescentContext } from '../../redux/hooks'
import { useRunDetailsQuery } from '../../apollo/hooks/run'
import { useEditRunDetailsMutation } from '../../apollo/hooks/run'

import moment from 'moment'


const EditRunDetailsContent = ({ 
  runName: oldName,
  runDescription: oldDescription,
  open, setOpen,
  editRunDescription, 
  editRunName, 
  loading, 
  dataDesc, 
  dataName 
}) => {
  const [runDetailsState, runDetailsDispatch] = useReducer(
    (state, action) => {
      const { type, value } = action
      switch (type) {
        case 'NAME':
          return { ...state, newName: value }
        case 'DESCRIPTION':
          return { ...state, newDescription: value }
      }
    }, {
    newName: oldName,
    newDescription: oldDescription
  }
  )

  useEffect(() => {
    if (open) {
      runDetailsDispatch({ type: 'NAME', value: oldName })
      runDetailsDispatch({ type: 'DESCRIPTION', value: oldDescription })
    }
  }, [open])   // when modal is open, set new name and description to match the old ones
  useEffect(() => { if (R.or(RA.isNotNil(dataDesc), RA.isNotNil(dataName))) { setOpen(false) } }, [dataDesc, dataName]) // close Modal when mutation successful


  const sameName = R.equals(oldName, runDetailsState.newName)
  const sameDesc = R.equals(oldDescription, runDetailsState.newDescription)
  const disabled = R.or(loading, R.and(sameName, sameDesc)) // disable button when loading or unchanged description/name

  // call appropriate mutate functions
  const submitButtonHandler = () => {
    if (!sameName) { editRunName({ variables: { newName: runDetailsState.newName } }) }
    if (!sameDesc) { editRunDescription({ variables: { newDescription: runDetailsState.newDescription } }) }
  }

  return (
    <Modal.Content>
      <Segment.Group>
        <Segment attatched='top' >
          <Header icon='edit' content={oldName} subheader='Edit the details of this run?' />
        </Segment >
        <Segment attatched='top bottom'>
          <Header as='h4'>Run Name</Header>
          <Input fluid value={runDetailsState.newName} onChange={(e, { value }) => { runDetailsDispatch({ type: 'NAME', value: value }) }} />
          <Header as='h4'>Run Description</Header>
          <Form>
            <Form.TextArea
              value={runDetailsState.newDescription}
              onChange={(e, { value }) => { runDetailsDispatch({ type: 'DESCRIPTION', value: value }) }}
            />
          </Form>
        </Segment>
        <Segment attatched='bottom'>
          <Button color='black' disabled={disabled} loading={loading} fluid content='Save' onClick={submitButtonHandler} />
        </Segment>
      </Segment.Group>
    </Modal.Content>
  )
}


const RunHeader = ({

}) => {
  const { runID } = useCrescentContext()
  const { run, editRunDescription, editRunName, loading, dataDesc, dataName } = useEditRunDetailsMutation({ runID })
  const [open, setOpen] = useState(false) // for the edit run details Modal

  if (R.isNil(run)) {
    return null
  }

  const {
    name: runName,
    description: runDescription,
    project: { name: projectName },
    createdOn,
    status,
    createdBy: {
      name: creatorName
    },

    datasets //{datasetID, name, size, hasMetadata}
  } = run
  const color = R.prop(status, {
    pending: 'orange',
    submitted: 'yellow',
    completed: 'green',
    failed: 'red'
  })

  return (
    <Modal
      basic
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={
        <Popup
          on='hover'
          trigger={
            <Label key={runName} as={Button} basic onClick={() => setOpen(true)}>
              <Header textAlign="center">{projectName}
                <Header.Subheader>{runName}</Header.Subheader>
              </Header>
            </Label>
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
                    ({ datasetID, name, cancerTag, size, hasMetadata }) => (
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
            </Message.Content>
          </Message>
        </Popup>
      }
    >
      <EditRunDetailsContent  {...{ runName, runDescription, open, runID, setOpen, editRunDescription, editRunName, loading, dataDesc, dataName }} />
    </Modal>
  )
}

export default RunHeader
