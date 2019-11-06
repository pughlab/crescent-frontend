import React, {useState, useEffect} from 'react';

import {Transition, Container, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../redux/hoc'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'

const NewRunCard = withRedux(({
  app: {
    project: {projectID}
  },
  actions: {
    setRun
  }
}) => {
  const [runName, setRunName] = useState('')
  const [createUnsubmittedRun, {loading, data, error}] = useMutation(gql`
    mutation CreateUnsubmittedRun($name: String!, $projectID: ID!) {
      createUnsubmittedRun(name: $name, projectID: $projectID) {
        runID
        params
        name
      }
    }
  `, {variables: {name: runName, projectID}})
    useEffect(() => {
      if (queryIsNotNil('createUnsubmittedRun', data)) {
        const {createUnsubmittedRun} = data
        // console.log('query not nil', data)
        setRun(createUnsubmittedRun)
      }
    }, [data])
  return (
    <Modal
      trigger={
        <Card link color='black'>
          <Card.Content>
          <Card.Header as={Header}>
            <Icon name='add' circular />
            <Header.Content>
              Create New Run
              <Header.Subheader content={'Configure a pipeline and run on the cloud'} />
            </Header.Content>
          </Card.Header>
          </Card.Content>
        </Card>
      }
    >
      <Modal.Header as={Header} textAlign='center' content='New Run' />
      <Modal.Content>
        <Form>
          <Form.Input fluid
            placeholder='Enter a Run Name'
            onChange={(e, {value}) => {setRunName(value)}}
          />
          <Form.Button fluid
            content='Create new run'
            onClick={() => createUnsubmittedRun()}
          />
        </Form>
      </Modal.Content>
    </Modal>
  )
})

const RunCard = withRedux(({
  actions: {
    setRun
  },

  run
}) => {
  const {
    runID, name, params
  } = run
  return (
    <Transition
      visible animation='zoom' duration={500} unmountOnHide={true} transitionOnMount={true}
    >
    <Card link onClick={() => setRun(run)} >
      <Card.Content>
        <Card.Header as={Header}>
          <Icon name='paper plane' circular />
          <Header.Content>
            {name}
            {/* <Header.Subheader content={runID} /> */}
          </Header.Content>
        </Card.Header>
      </Card.Content>
      <Card.Content>
        <Popup
          wide
          trigger={<Button icon='info' basic />}
          content={<Label content='Run ID' detail={runID} />}
        />
        {
          RA.isNotNil(params) &&
          <Popup 
            wide
            trigger={<Button icon='sliders horizontal' />} 
            content={
              R.compose(
                ({
                  singleCell,
                  numberGenes: {min: minNumberGenes, max: maxNumberGenes},
                  percentMito: {min: minPercentMito, max: maxPercentMito},
                  resolution,
                  principalDimensions,
                }) => (
                  <Label.Group>
                    <Label content='Single Cell Input Type' detail={singleCell} />
                    <Label content='Number of Genes' detail={`Min = ${minNumberGenes} | Max = ${maxNumberGenes}`} />
                    <Label content='Mitochondrial Fraction' detail={`Min = ${minPercentMito} | Max = ${maxPercentMito}`} />
                    <Label content='Clustering Resolution' detail={resolution} />
                    <Label content='PCA Dimensions' detail={principalDimensions} />

                  </Label.Group>
                ),
                JSON.parse
              )(params)
            }
          />
        }
      </Card.Content>
    </Card>
    </Transition>
  )
})

const RunsCardList = withRedux(({
  app: {
    project: {
      runs
    },
  }
}) => {
  return (
    <Container>
      <Divider content='Viewing Runs' horizontal/>
      <Card.Group itemsPerRow={3} style={{maxHeight: '75vh', overflowY: 'scroll'}}>
        <NewRunCard />
      {
        R.addIndex(R.map)(
          (run, index) => <RunCard key={index} {...{run}} />,
          runs
        )
      }
      </Card.Group>
    </Container>
  )
})

export default RunsCardList