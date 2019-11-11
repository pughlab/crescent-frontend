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

import VisComponent from './vis'


const MainComponent = withRedux(
  ({
    app: {
      view: {main: mainView}
    },
    session,
  }) => {
    // useEffect(() => {
    //   session.subscribe(
    //     'crescent.result',
    //     (args, {runID}) => {
    //       console.log('crescent.result')
    //       setActiveToggle('results')
    //       setCurrentRunId(runID)
    //       setLoading(false)
    //       setSubmitted(false)
    //     }
    //   )
    // }, [])

    // const [visType, setVisType] = useState('tsne')
    // const isCurrentVisType = R.equals(visType)
    // useEffect(() => {
    //   RA.isNotNil(currentRunId) && RA.isNotNil(visType) 
    //   && fetch(`/result?runID=${currentRunId}&visType=${visType}`)
    //     .then(response => response.blob())
    //     .then(R.compose(setResult, URL.createObjectURL))
    //   && setLoading(false)
    // }, [currentRunId, visType])
    return (
      <Segment basic attached='bottom' style={{height: '91%', marginTop: 0,  backgroundImage: `url(${memphisMini})`}} as={Grid}>
      {
        R.cond([
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
