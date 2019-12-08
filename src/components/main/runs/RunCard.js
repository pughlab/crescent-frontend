import React, {useState, useEffect} from 'react';

import {Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import withRedux from '../../../redux/hoc'

import Marquee from 'react-marquee'
import moment from 'moment'

import { useMutation, useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import {queryIsNotNil} from '../../../utils'


const RunCard = withRedux(({
  app: {
    user: {userID: currentUserID}
  },
  // Redux actions
  actions: {setRun},
  // Prop
  run,
  refetch //refetchs all project runs
}) => {
  const {
    runID, name, params,
    createdBy: {userID: creatorUserID, name: creatorName},
    status, createdOn, submittedOn, completedOn
  } = run
  console.log(currentUserID, creatorUserID)
  const [deleteRun, {data, loading, error}] = useMutation(gql`
    mutation DeleteRun($runID: ID!) {
      deleteRun(runID: $runID) {
        runID
      }
    }
  `, {
    variables: {runID},
    onCompleted: data => refetch()
  })
  
  const currentUserIsCreator = R.equals(currentUserID, creatorUserID)
  return (
    <Transition visible animation='fade down' duration={500} unmountOnHide={true} transitionOnMount={true}>
    <Card color={R.prop(status, {pending: 'orange', completed: 'green', submitted: 'yellow'})}>
      <Card.Content>
        <Label attached='top'
          // Color based on whether run is complete or not
          color={R.prop(status, {pending: 'orange', completed: 'green', submitted: 'yellow'})}
        >
          <Icon
            name={R.prop(status, {pending: 'circle outline', completed: 'circle outline check', submitted: 'circle notch'})}
            loading={R.equals('submitted', status)}
            size='large' style={{marginLeft: 0}}
          />
          {
            R.prop(status, {
              pending: 'PENDING USER SUBMISSION',
              submitted: 'SUBMITTED AND RUNNING',
              completed: 'RUN COMPLETED'
            })
          }
        </Label>
        <Card.Header>
          <Header size='small'>
            <Marquee text={name} />
          </Header>
        </Card.Header>
      </Card.Content>
      <Card.Content>
        <Button.Group widths={currentUserIsCreator ? 3 : 2}>
        <Button basic fluid animated='vertical' onClick={() => setRun(run)}>
          <Button.Content visible><Icon name='eye'/></Button.Content>
          <Button.Content hidden content='View' />
        </Button>

        <Modal
          trigger={
            <Button basic fluid animated='vertical'>
              <Button.Content visible><Icon name='sliders horizontal'/></Button.Content>
              <Button.Content hidden content='Parameters' />
            </Button>
          }
        >
          <Modal.Header as={Header} textAlign='center' content='Run Parameters' />
          <Modal.Content>
          {
            RA.isNotNil(params) ?
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
            :
              <Divider horizontal content='No parameters saved yet' />
          }
          </Modal.Content>
        </Modal>
        
        {
          currentUserIsCreator &&
            <Modal
              basic size='small'
              trigger={
                <Button basic fluid animated='vertical'>
                  <Button.Content visible><Icon name='trash' /></Button.Content>
                  <Button.Content hidden content='Delete' />
                </Button>
              }
            >
              <Modal.Content>
                <Segment attached='top'>
                  <Header icon='trash' content={name} subheader='Are you sure you want to delete this run?' />
                </Segment>
                <Segment attached='bottom'>
                <Button fluid color='red' inverted 
                  onClick={() => deleteRun()}
                >
                  <Icon name='checkmark' />
                  Yes, delete this run
                </Button>
                </Segment>
              </Modal.Content>
            </Modal>
        }
        </Button.Group>
      </Card.Content>
      <Card.Content>
        <Label.Group>
          <Label content='Owner' detail={creatorName} />
          <Label content='Created' detail={`${moment(createdOn).format('D MMMM YYYY, h:mm a')}`} />
          {
            RA.isNotNil(submittedOn) &&
              <Label content='Submitted' detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`} />
          }
          {
            RA.isNotNil(completedOn) &&
              <Label content='Completed' detail={`${moment(completedOn).format('D MMMM YYYY, h:mm a')}`}/>
          }
          {
            RA.isNotNil(submittedOn) &&
              <Label content='Time Elapsed' detail={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'minutes')} minutes`}/>
          }
        </Label.Group>
      </Card.Content>
    </Card>
    </Transition>
  )
})

export default RunCard