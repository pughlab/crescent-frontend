import React, {useState, useEffect} from 'react';

import {Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup, Message} from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import Marquee from 'react-marquee'
import moment from 'moment'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {setRun} from '../../../../redux/actions/context'
import {useRunDetailsQuery, useCellCountsQuery} from '../../../../apollo/hooks'

const ParameterPopoverContent = ({
  normalization,
  reduction,
  clustering,
  expression
}) => {
  // const {
  //   normalization,
  //   reduction,
  //   clustering,
  //   expression
  // } = parameters
  const parameterValues = R.compose(
    // R.flatten,
    R.unnest,
    R.values,
    R.map(R.toPairs)
  )([normalization, reduction, clustering, expression])
  // console.log(parameterValues)
  return (
    <Message>
      <Message.Content>
        <Divider horizontal content='Parameters' />
        <Label.Group>
        {
          R.map(
            ([parameterKey, parameterValue]) => (
              <Label key={parameterKey} content={parameterKey} detail={parameterValue} />
            ),
            parameterValues
          )
        }
        </Label.Group>
      </Message.Content>
    </Message>
  )
}

const RunCard = ({
  run
}) => {
  const dispatch = useDispatch()
  const {userID: currentUserID} = useCrescentContext()

  const {
    runID, name,
    parameters: {
      quality,
      normalization,
      reduction,
      clustering,
      expression
    },
    createdBy: {
      userID: runCreatorUserID,
      name: creatorName
    },
    status, hasResults, createdOn, submittedOn, completedOn
  } = run

  const cellcount = useCellCountsQuery(runID)

  if (R.isNil(cellcount)) {return null}

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
      onClick={() => dispatch(setRun({runID}))}
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
        <ParameterPopoverContent {...{normalization,reduction,clustering,expression}} />
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
                <Label content={<Icon style={{margin: 0}} name='upload' />} detail={`${R.length(R.keys(quality))} dataset(s)`}/>
            }
            {
              hasResults &&
                <Label content={<Icon style={{margin: 0}} name='exclamation circle' />} detail={'Results available'} />
            }
            {
              RA.isNotNil(submittedOn) &&
              RA.isNotNil(cellcount) &&
                <Label content={<Icon style={{margin: 0}} name='certificate' />} detail={`${cellcount} cells`}/>
            }
          </Label.Group>
        </Card.Header>
      </Card.Content>

    </Card>
  )
}

export default RunCard