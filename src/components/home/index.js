import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Grid, Image, Step } from 'semantic-ui-react'

import VisHeader from './Header'

import Expression from '../expression'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../redux/hoc'

import ProjectsCardList from './projects'
import RunsCardList from './runs'

import SidebarComponent from './sidebar'
import {
  ParametersComponent,
  DatasetComponent,
  ResultsComponent
} from './main'

const VisualizationComponent = withRedux(
  ({
    app: {
      user,
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
      <Segment basic attached='top' style={{height: '92%'}} as={Grid}>
      {
        R.cond([
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
              <Grid.Column width={12} style={{height: '100%'}}>
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
              </Grid.Column>
              <Grid.Column width={4} style={{height: '100%'}}>
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
