import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Button, Grid, Image, Step, Header, Label } from 'semantic-ui-react'

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
        <Grid.Column width={10} style={{height: '100%'}}>
          <Segment raised style={{height: '100%'}}
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
        </Grid.Column>
        <Grid.Column width={6} style={{height: '100%'}}>
          <SidebarComponent />
        </Grid.Column>
      </>
    )
  }
)

export default VisComponent
