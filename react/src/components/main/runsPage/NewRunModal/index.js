import React, {useState, useReducer} from 'react'

import {Header, Form, Button, Modal, Icon, Divider} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import DataForm from './DataForm'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {setAnnotationsRunID} from '../../../../redux/actions/annotations'
import {setRun} from '../../../../redux/actions/context'


// TODO: GQL QUERIES FOR PROJECT DETAILS
const NewRunModal = ({
  project
}) => {
  const dispatch = useDispatch()
  const {userID, projectID} = useCrescentContext()

  const [runName, setRunName] = useState('')
  const [runDescription, setRunDescription] = useState('')
  const [datasetsState, datasetsDispatch] = useReducer(
    function (state, action) {
      const maxDatasets = 20
      const {type} = action
      switch (type) {
        case 'TOGGLE_DATASET':
          const {datasetID} = action
          return R.ifElse(
            R.includes(datasetID),
            R.without([datasetID]),
            // Limit number of datasets to three
            R.ifElse(
              R_.gtThanLength(maxDatasets),
              R.append(datasetID),
              R.identity
            )
          )(state)

        case 'TOGGLE_MANY_DATASETS':
          const {datasetIDs} = action
          return R.ifElse(
            R_.gtThanLength(maxDatasets),
            R.union(datasetIDs),
            R.identity
          )(state)
        default:
          return state
      }
    },
    []
  )

  const [createUnsubmittedRun, {loading, data, error}] = useMutation(gql`
    mutation CreateUnsubmittedRun(
      $name: String!,
      $description: String!,
      $projectID: ID!,
      $userID: ID!
      $datasetIDs: [ID!]!
    ) {
      createUnsubmittedRun(
        name: $name
        description: $description
        datasetIDs: $datasetIDs
        projectID: $projectID
        userID: $userID
      ) {
        runID
      }
    }
  `, {
    variables: {
      name: runName,
      description: runDescription,
      datasetIDs: datasetsState,
      projectID, userID,
    },
    onCompleted: ({createUnsubmittedRun: run}) => {
      console.log(run)
      if (RA.isNotNil(run)) {
        const {runID} = run
        dispatch(setRun({runID}))
        dispatch(setAnnotationsRunID({runID}))
      }
    }
  })

  const disabled = R.or(
    R.isEmpty(runName),
    R.isEmpty(datasetsState)
  )
  return (
    <Modal
      trigger={
        <Button fluid size='large' color='black' animated='vertical' disabled={RA.isNotNil(project.archived)}>
          <Button.Content visible><Icon size='large' name='add'/></Button.Content>
          <Button.Content hidden content="Configure a pipeline and submit a run using this project's uploaded data"/>
        </Button>
      }
    >
      <Modal.Header>
        <Header textAlign='center' content='New Run'
          subheader={`Enter a run name and select up to 20 datasets (${R.length(datasetsState)}/20)`}
        />
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input fluid
            placeholder='Enter a Run Name'
            onChange={(e, {value}) => setRunName(value)}
          />
          <Form.Input fluid
            placeholder='Enter a Run Description - Optional'
            onChange={(e, {value}) => setRunDescription(value)}
          />

          <DataForm {...{project, datasetsState, datasetsDispatch}} />

          <Form.Button size='huge' fluid
            disabled={disabled}
            color={disabled ? undefined : 'black'}
            content='Create Run'
            onClick={() => createUnsubmittedRun()}
          />
        </Form>
      </Modal.Content>
    </Modal>
  )
}

export default NewRunModal