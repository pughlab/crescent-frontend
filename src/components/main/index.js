import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Grid, Image, Step, Header, Label } from 'semantic-ui-react'

import memphisMini from '../../memphis-mini.png'

import Expression from '../expression'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

import ProjectsCardList from './projects'
import RunsCardList from './runs'
import LandingPageComponent from '../landing'
import PortalInfo from './info'

import VisComponent from './vis'


const MainComponent = withRedux(
  ({
    app: {
      view: {main: mainView}
    },
  }) => {
    return (
      <Segment basic attached='bottom' style={{minHeight: 'calc(100vh - 5rem - 2px)', marginTop: 0,  backgroundImage: `url(${memphisMini})`}} as={Grid}>
      {
        R.cond([
          [R.equals('info'), R.always(
            <PortalInfo />
          )],
          [R.equals('login'), R.always(
            <LandingPageComponent />
          )],  
          [R.equals('projects'), R.always(
            <Grid.Column width={16} style={{height: '100%'}}>
              <ProjectsCardList />
            </Grid.Column>
          )],
          [R.equals('runs'), R.always(
            <Grid.Column width={16} style={{height: '100%'}}>
              <RunsCardList />
            </Grid.Column>
          )],
          [R.equals('vis'), R.always(
            <VisComponent />
          )],
        ])(mainView)
      }
      </Segment>
    )
  }
)

export default MainComponent
