import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Step, Header } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery, useResultsAvailableQuery} from '../../../../apollo/hooks'
import {setActiveResult} from '../../../../redux/actions/resultsPage'

import VisualizationMenu from '../../resultsPage/visualizations/VisualizationMenu'
import QualityControlMenu from '../../resultsPage/visualizations/QualityControlMenu'

const VisualizationsSidebar = ({
}) => {    
  const {runID} = useCrescentContext()

  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()
  const {activeResult} = useResultsPage()
  const isActiveResult = R.equals(activeResult)

  const plots = useResultsAvailableQuery(runID)

  if (R.any(R.isNil, [run, plots])) {
    return null
  }
  const {status: runStatus} = run
  // console.log('run status:')
  // console.log(runStatus)


  return (
    <>
    {
      R.equals('pending', runStatus) ?
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            This run is not submitted yet
          </Header>
        </Segment>
      : R.equals('submitted', runStatus) ?
        <Segment placeholder>
          <Header icon>
            <Icon name='exclamation' />
            The pipeline is currently running. 
          </Header>
        </Segment>
      :
        // runStatus is 'completed'
        R.ifElse(
          R.isNil,
          R.always(
            <Step.Group vertical fluid size='small'>
            {
              R.ifElse(
                R.isEmpty,
                R.always(<Step key={"noresults"}><Step.Content title={"No Results Available"} description={"Please run the pipeline to view results"}/></Step>),
                R.addIndex(R.map)(
                  ({result, label, description}, index) => (
                    // (result, index) => (
                    <Step key={index}
                      onClick={() => dispatch(setActiveResult({result}))}

                    >
                      {
                        isActiveResult(result)
                        && <Icon name='eye' color='violet'/>
                      }
                      <Step.Content title={label} description={description} />
                      {/* <Step.Content title={result} description={result} /> */}
                    </Step>
                  )
                )
              )(plots)
            }
            </Step.Group>
          ),
          R.always(
            <Segment.Group>
              <Button color='violet' fluid  animated='vertical' attached='top'
                onClick={() => dispatch(setActiveResult({result: null}))}

              >
                <Button.Content visible>
                  <Icon name='arrow left' />
                </Button.Content>
                <Button.Content hidden>
                  Click to go back
                </Button.Content>
              </Button>
              <Segment>
                {
                R.ifElse(
                  R.equals('qc'),
                  R.always(<QualityControlMenu/>),
                  R.always(<VisualizationMenu/>)
                )(activeResult)
                }
              </Segment>
            </Segment.Group>
          )
        )(activeResult)
      }
      </>
    )
}

export default VisualizationsSidebar