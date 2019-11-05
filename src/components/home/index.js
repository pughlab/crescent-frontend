import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Grid, Image, Step, Header, Label } from 'semantic-ui-react'

// import VisHeader from './Header'
import memphisMini from '../../memphis-mini.png'

import Expression from '../expression'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

import ProjectsCardList from './projects'
import RunsCardList from './runs'
import LandingPageComponent from '../landing'

import SidebarComponent from './sidebar'
import {
  ParametersComponent,
  DatasetComponent,
  ResultsComponent
} from './main'

console.log(ResultsComponent)

const VisHeader = withRedux(
  ({
    app: {
      project: {
        name: projectName
      },
      run: {
        name: runName
      },
      view: {main: mainView, sidebar: sidebarView}
    }
  }) => {
    const color = R.cond([
      [R.isNil, R.always(undefined)],
      [R.equals('dataset'), R.always('teal')],
      [R.equals('pipeline'), R.always('blue')],
      [R.equals('results'), R.always('violet')]
    ])(sidebarView)
    return (
      <Segment attached='top' color={color}>
          <Label color={color} content={projectName} detail={runName} />
      </Segment>
    )
  }
)

const VisualizationComponent = withRedux(
  ({
    app: {
      user,
      project,
      run,
      view: {main: mainView, sidebar: sidebarView}
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
      <Segment basic attached='top' style={{height: '92%', backgroundImage: `url(${memphisMini})`}} as={Grid}>
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
            <>
              <Grid.Column width={10} style={{height: '100%'}}>
                <Segment raised style={{height: '100%'}}
                  color={
                    R.cond([
                      [R.equals('dataset'), R.always('teal')],
                      [R.equals('pipeline'), R.always('blue')],
                      [R.equals('results'), R.always('violet')],
                    ])(sidebarView)                    
                  }
                >
                {
                  R.cond([
                    [R.equals('dataset'), R.always(
                      <DatasetComponent />
                    )],
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
          )],
        ])(mainView)
      }
      </Segment>
    )
  }
)

export default VisualizationComponent
