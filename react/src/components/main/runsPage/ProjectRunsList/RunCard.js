import React, { useState, useEffect } from 'react';

import { Transition, Segment, Card, Header, Form, Button, Modal, Label, Divider, Icon, Popup, Message } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as R_ from 'ramda-extension'

import Marquee from 'react-marquee'
import moment from 'moment'

import { useDispatch } from 'react-redux'
import { useCrescentContext } from '../../../../redux/hooks'
import { setRun } from '../../../../redux/actions/context'
import { useCellCountsQuery } from '../../../../apollo/hooks/results'

const ParameterPopoverContent = ({
  datasets,
  normalization,
  reduction,
  clustering,
  expression,
  description,
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
    <>
      {
        R.and(RA.isNotEmpty(description), RA.isNotNil(description)) &&
        <Message size='mini'>
          <Message.Content>
            <Divider horizontal content='Details' />
            {description}
          </Message.Content>
        </Message>
      }

      <Message>
        <Message.Content>
          <Divider horizontal content='Datasets' />
          <Label.Group>
            {
              R.map(
                ({ datasetID, name, cancerTag }) => (
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
    </>

  )
}

const RunCard = ({
  run
}) => {
  const dispatch = useDispatch()
  const { userID: currentUserID } = useCrescentContext()

  const {
    runID, name, description,
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
    status, hasResults, createdOn, submittedOn, completedOn,
    datasets
  } = run

  const cellcount = useCellCountsQuery(runID)
  // if (R.isNil(cellcount)) {return null}

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
      onClick={() => dispatch(setRun({ runID }))}
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
        <ParameterPopoverContent {...{ datasets, normalization, reduction, clustering, expression, description }} />
      </Popup>

      <Card.Content>
        <Card.Header>
          <Header size='small'>
            <Marquee text={name} />
          </Header>
          <Label.Group>
            <Label content={<Icon style={{ margin: 0 }} name='user' />} detail={creatorName} />
            {/* <Label content='Created' detail={`${moment(createdOn).format('D MMMM YYYY, h:mm a')}`} /> */}
            {
              RA.isNotNil(submittedOn) &&
              <Label content={<Icon style={{ margin: 0 }} name='calendar alternate outline' />} detail={`${moment(submittedOn).format('D MMMM YYYY, h:mm a')}`} />
            }
            {/* {
              RA.isNotNil(completedOn) &&
                <Label content='Completed' detail={`${moment(completedOn).format('D MMMM YYYY, h:mm a')}`}/>
            } */}
            {
              RA.isNotNil(submittedOn) &&
              <Label content={<Icon style={{ margin: 0 }} name='clock' />} detail={`${moment(RA.isNotNil(completedOn) ? completedOn : new Date()).diff(moment(submittedOn), 'minutes')} minutes`} />
            }
            {
              <Label content={<Icon style={{ margin: 0 }} name='upload' />} detail={`${R.length(datasets)} dataset(s)`} />
            }
            {
              hasResults &&
              <Label content={<Icon style={{ margin: 0 }} name='exclamation circle' />} detail={'Results available'} />
            }
            {
              RA.isNotNil(submittedOn) &&
              RA.isNotNil(cellcount) &&
              <Label content={<Icon style={{ margin: 0 }} name='certificate' />} detail={`${cellcount} cells`} />
            }
          </Label.Group>
        </Card.Header>
      </Card.Content>

    </Card>
  )
}

export default RunCard