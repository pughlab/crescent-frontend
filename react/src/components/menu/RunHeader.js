import React, { useState, useEffect } from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Header, Popup, Message, Label, Divider, Modal, Button, Segment, Input } from 'semantic-ui-react'

import { useCrescentContext } from '../../redux/hooks'
import { useRunDetailsQuery } from '../../apollo/hooks/run'
import { useEditRunDetailsMutation } from '../../apollo/hooks/run'

import moment from 'moment'


const EditRunDetailsContent = ({ runName: oldName, runDescription: oldDescription, open, runID, setOpen }) => {
  const [newName, setNewName] = useState(oldName)
  const [newDescription, setNewDescription] = useState(oldDescription)
  const {editRunDescription, editRunName, loadingDesc, dataDesc, loadingName, dataName} = useEditRunDetailsMutation({runID})

  // when modal is open, set new name and description to match the old ones
  useEffect(() => { if (open) { setNewName(oldName) } }, [open])
  useEffect(() => { if (open) { setNewDescription(oldDescription) } }, [open])
  useEffect(() => {if (R.or(RA.isNotNil(dataDesc), RA.isNotNil(dataName))) {setOpen(false)}}, [dataDesc, dataName]) // close Modal when mutation successful


  const sameName = R.equals(oldName, newName)
  const sameDesc = R.equals(oldDescription, newDescription)
  const disabled = R.any(RA.isTrue, [loadingDesc, loadingName, R.and(sameName, sameDesc)]) // disable button when loading or unchanged description/name
  
  // call appropriate mutate functions
  const submitButtonHandler = () => {
    if (!sameName) {editRunName({variables: {newName}})}
    if (!sameDesc) {editRunDescription({variables: {newDescription}})}
  }

  return (
    <Modal.Content>
      <Segment.Group>
        <Segment attatched='top' >
          <Header icon='edit' content={oldName} subheader='Are you sure you want to edit this run?' />
        </Segment >
        <Segment attatched>
          <Header as='h4'>Run Name</Header>
          <Input fluid value={newName} onChange={(e, { value }) => { setNewName(value) }} />
          <Header as='h4'>Run Description</Header>
          <Input fluid value={newDescription} onChange={(e, { value }) => { setNewDescription(value) }} />
        </Segment>
        <Segment attatched='bottom'>
          <Button color='black' disabled={disabled} loading={R.or(loadingDesc, loadingName)} fluid content='Save' onClick={submitButtonHandler}/>
        </Segment>
      </Segment.Group>
    </Modal.Content>
  )
}


const RunHeader = ({

}) => {
  const { runID } = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const [open, setOpen] = useState(false) // for the edit run details modal
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
            <Label as={Button} basic onClick={() => setOpen(true)}>
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
      <EditRunDetailsContent  {...{ runName, runDescription, open, runID, setOpen }} />
    </Modal>
  )
}

export default RunHeader