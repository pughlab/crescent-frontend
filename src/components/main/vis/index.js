import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import withRedux from '../../../redux/hoc'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import ResultsComponent from './results'



const VisComponent = withRedux(
  ({
    app: {
      view: {main: mainView, sidebar: sidebarView}
    },
  }) => {
    return (
      <>
      <Grid style={{minHeight: 'calc(100vh - 12rem - 2px)'}}>
        <Grid.Column width={11} style={{minHeight: '100%'}}>
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
        <Grid.Column width={5} style={{minHeight: '100%'}}>
          <SidebarComponent />
        </Grid.Column>
      </Grid>
      </>
    )
  }
)

export default VisComponent
