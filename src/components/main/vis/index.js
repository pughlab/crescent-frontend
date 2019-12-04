import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import ResultsComponent from './results'

const RunMessage = withRedux(
  ({
    app: {
      run: {
        status
      }
    }
  }) => {
    return (
      <Message
        color={R.prop(status, {pending: 'orange', submitted: 'yellow', completed: 'green'})}
      >
        <Message.Header as={Header} size='large'
          content={
            R.ifElse(
              R.equals('pending'),
              R.always('Configure your parameters below'),
              R.always(`Run is ${status} and so parameters are not configurable`)
            )(status)
          }
        />
        <Message.Header as={Header} size='large'
          content={
            R.prop(status, {
              pending: "Click 'SUBMIT RUN' on the right to send job to HPC",
              submitted: 'You will be notified when your run is completed',
              completed: "Click 'Results' on the right to view visualizations",
            })
          }
        />
      </Message>
    )
  }
)

const VisComponent = withRedux(
  ({
    app: {
      view: {main: mainView, sidebar: sidebarView}
    },
  }) => {
    return (
      <Grid>
        <Grid.Column width={16}>
          <RunMessage />
        </Grid.Column>
        <Grid.Column width={11}>
          <Transition visible animation='fade right' duration={1000} unmountOnHide={true} transitionOnMount={true}>
          <Segment style={{height: '100%'}}
            color={
              R.cond([
                [R.equals('pipeline'), R.always('blue')],
                [R.equals('results'), R.always('violet')],
              ])(sidebarView)                    
            }
          >
          {
            R.cond([
              [R.equals('pipeline'), R.always(
                <ParametersComponent />
              )],
              [R.equals('results'), R.always(
                <ResultsComponent />
              )],
            ])(sidebarView)
          }
          </Segment>
          </Transition>
        </Grid.Column>
        <Grid.Column width={5} style={{height: '100%'}}>
          <SidebarComponent />
        </Grid.Column>
      </Grid>
    )
  }
)

export default VisComponent
