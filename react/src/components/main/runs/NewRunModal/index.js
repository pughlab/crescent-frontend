import React, {useState, useEffect, useReducer} from 'react';

import {Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup, List} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../../utils'

import DataForm from './DataForm'

const NewRunModal = withRedux(({
  app: {
    user: {userID},
    project: {projectID, mergedProjects, uploadedDatasets}
  },
  actions: {setRun},
  refetch
}) => {
  const [runName, setRunName] = useState('')
  const [datasetsState, datasetsDispatch] = useReducer(
    function (state, action) {
      const {type} = action
      switch (type) {
        case 'TOGGLE_DATASET':
          const {datasetID} = action
          return R.includes(datasetID, state) ?
            R.without([datasetID], state)
            : R.append(datasetID, state)
        case 'TOGGLE_MANY_DATASETS':
          const {datasetIDs} = action
          return R.union(datasetIDs, state)
          // return R.ifElse(
          //   R.compose(
          //     R.isEmpty,
          //     R.difference(datasetIDs)
          //   ),
          //   ,
          //   R.without(datasetIDs)
          // )(state)
        
          
          
        default:
          return state
      }
    },
    []
  )
  console.log(datasetsState)

  const [createUnsubmittedRun, {loading, data, error}] = useMutation(gql`
    mutation CreateUnsubmittedRun(
      $name: String!,
      $projectID: ID!,
      $userID: ID!
    ) {
      createUnsubmittedRun(name: $name, projectID: $projectID, userID: $userID) {
        runID
        createdOn
        createdBy {
          userID
          name
        }
        name
        params
        status

        submittedOn
        completedOn
      }
    }
  `, {
    variables: {name: runName, projectID, userID},
    // Refetch runs on new created
    onCompleted: ({createUnsubmittedRun: newRun}) => {
      refetch()
      setRun(newRun)
    }
  })
  return (
    <Modal
      trigger={
        <Button fluid size='large'
          color='black'
          animated='vertical'
        >
          <Button.Content visible><Icon size='large' name='add'/></Button.Content>
          <Button.Content hidden content="Configure a pipeline and submit a run using this project's uploaded data"/>
        </Button>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Run' />
      <Modal.Content>
        <Form>
          <Form.Input fluid
            placeholder='Enter a Run Name'
            onChange={(e, {value}) => {setRunName(value)}}
          />

          <DataForm {...{datasetsState, datasetsDispatch}} />

          <Form.Button size='huge' fluid
            disabled={R.or(
              R.isEmpty(runName),
              R.isEmpty(datasetsState)
            )}
            content='Create Run'
            onClick={() => createUnsubmittedRun()}
          />
        </Form>
      </Modal.Content>
    </Modal>
  )
})

export default NewRunModal