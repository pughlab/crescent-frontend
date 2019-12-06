import React, {useState, useEffect} from 'react'

import * as R from 'ramda'

import {Segment, Header, Icon} from 'semantic-ui-react'

import withRedux from '../../../../redux/hoc'

import ScatterPlot from './ScatterPlot'

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
    },
    actions: {
      toggle: {}
    }
  }) => {
    const ResultsHeader = R.ifElse(
      R.isNil,
      R.always(),
      R.path([activeResult, 'label'])
    )(availablePlots)
      
    return (
      <>
      {
        R.equals('pending', runStatus) ? 
          <Segment basic placeholder style={{height: '100%'}}>
            <Header textAlign='center' icon>
              <Icon name='exclamation' />
              You must submit a job to have results
            </Header>
          </Segment>
        : R.equals('submitted', runStatus) ?
          <Segment basic placeholder style={{height: '100%'}}>
            {/* <Header textAlign='center'>
              Run is currently being run
            </Header> */}
            <Header textAlign='center' icon>
              <ClimbingBoxLoader style={{margin: 0}} />
            </Header>
          </Segment>
        :
          R.ifElse(
            R.isNil,
            R.always(
              <Segment basic placeholder style={{height: '100%'}}>
                <Header textAlign='center' icon>
                  <Icon name='right arrow' />
                  Select a visualization on the right
                </Header>
              </Segment>
            ),
            R.always(
              <Segment basic style={{height: '90vh'}}>
                <Header textAlign='center'>{ResultsHeader}</Header>
                <ScatterPlot/>
              </Segment>
            )
          )(activeResult)
        }
        </>
    )
  }
)

export default ResultsComponent