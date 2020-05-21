import React, {useState, useEffect} from 'react'

import * as R from 'ramda'

import {Segment, Header, Icon} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import ScatterPlot from './ScatterPlot'
import ViolinPlot from './ViolinPlot'
import QCPlot from './QCPlot'
import HeatMap from './HeatMap'


import {ClimbingBoxLoader} from 'react-spinners'

const ResultsComponent = withRedux(
  ({
    app: {
      run: {
        runID,
        status: runStatus
      },
      toggle: {
        vis: {results: {activeResult, availablePlots}}
      }
    }
  }) => {

    const determinePlotType = R.cond([
      [R.equals('violin'), R.always(<ViolinPlot/>)],
      [R.equals('qc'), R.always(<QCPlot/>)],
      [R.equals('tsne'), R.always(<ScatterPlot/>)],
      [R.equals('umap'), R.always(<ScatterPlot/>)],
      [R.equals('heatmap'), R.always(<HeatMap/>)]
    ])

    return (
      <>
      {
        // Prompts for if run is pending...
        R.equals('pending', runStatus) ? 
          <Segment basic placeholder style={{height: '100%'}}>
            <Header textAlign='center' icon>
              <Icon name='exclamation' />
              This run is not submitted yet
            </Header>
          </Segment>
        // ... or if run is submitted and running on cloud
        : R.equals('submitted', runStatus) ?
          <Segment basic placeholder style={{height: '100%'}}>
            <Header textAlign='center' icon>
              <ClimbingBoxLoader style={{margin: 0}} />
            </Header>
          </Segment>
        :
        // ... otherwise visualize results
          R.ifElse(
            R.isNil,
            R.always(
              <Segment basic placeholder style={{height: '75vh'}}>
                <Header textAlign='center' icon>
                  <Icon name='right arrow' />
                  Select a visualization on the right
                </Header>
              </Segment>
            ),
            R.always(
              <Segment basic style={{height: '80vh', padding: 0}}>
                {determinePlotType(activeResult)}
              </Segment>
            )
          )(activeResult)
        }
        </>
    )
  }
)

export default ResultsComponent