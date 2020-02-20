import React, {useState, useEffect} from 'react';

import {Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup, Message} from 'semantic-ui-react'

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
    user: {userID: currentUserID},
    project: {
      createdBy: {
        userID: projectCreatorUserID
      }
    }
  },
  // Redux actions
  actions: {setRun},
  // Prop
  run,
  refetch //refetchs all project runs
}) => {
  const {
    runID, name, params,
    createdBy: {userID: runCreatorUserID, name: creatorName},
    status, createdOn, submittedOn, completedOn
  } = run
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
  
  const currentUserIsRunCreator = R.equals(currentUserID, runCreatorUserID)
  const currentUserIsProjectCreator = R.equals(currentUserID, projectCreatorUserID)
  const currentUserCanDeleteRun = R.or(currentUserIsProjectCreator, currentUserIsRunCreator)
  const color = R.prop(status, {
    pending: 'orange',
    submitted: 'yellow',
    completed: 'green',
    failed: 'red'
  })
  const icon = R.prop(status, {
    pending: 'circle outline',
    submitted: 'circle notch',
    completed: 'circle check outline',
    failed: 'times circle outline'
  })
  return (
    <Card color={color}
      onClick={() => setRun(run)}
    >

    <Popup
      size='large' wide='very'
      trigger={
        <Button attached='top' color={color} animated='vertical'>
          <Icon
            name={icon}
            loading={R.equals('submitted', status)}
            size='large'
          />
        </Button>
      }
    >
      <Message>
        <Message.Header content='Run Parameters' />
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
      </Message>


        {/* {
          currentUserCanDeleteRun &&
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
        } */}
    </Popup>
    <Card.Content>
        <Card.Header>
          <Header size='small'>
            <Marquee text={name} />
          </Header>
          <Label.Group>
            <Label content={<Icon style={{margin: 0}} name='user' />}  detail={creatorName} />
            {/* <Label content='Created' detail={`${moment(createdOn).format('D MMMM YYYY, h:mm a')}`} /> */}
            {
              RA.isNotNil(submittedOn) &&
                <Label content={<Icon style={{margin: 0}} name='calendar alternate outline' />} detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`} />
            }
            {/* {
              RA.isNotNil(completedOn) &&
                <Label content='Completed' detail={`${moment(completedOn).format('D MMMM YYYY, h:mm a')}`}/>
            } */}
            {
              RA.isNotNil(submittedOn) &&
                <Label content={<Icon style={{margin: 0}} name='clock' />} detail={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'minutes')} minutes`}/>
            }
            {
              RA.isNotNil(submittedOn) &&
                <Label content={<Icon style={{margin: 0}} name='file archive' />} detail='1'/>
            }
            {
              RA.isNotNil(submittedOn) &&
                <Label content={<Icon style={{margin: 0}} name='certificate' />} detail='1000'/>
            }
          </Label.Group>
        </Card.Header>
      </Card.Content>
    </Card>
  )
})

export default RunCard