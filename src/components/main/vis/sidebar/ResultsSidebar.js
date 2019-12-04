import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Divider, Step, Header } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import withRedux from '../../../../redux/hoc'
import VisualizationMenu from '../results/VisualizationMenu';

const ResultsSidebar = withRedux(
  ({
    app: {
      run: {
        runID,
        status: runStatus
      },
      toggle: {vis: {results: {activeResult, availablePlots}}}
    },
    actions: {
      toggle: {
        setActiveResult
      },
      thunks: {
        initializeResults,
        clearResults
      }
    },
  }) => {
    useEffect(() => {
      initializeResults(runID)
      return clearResults()
    }, [])

    const isActiveResult = R.equals(activeResult)
    return (
      <>
      {
        R.equals('pending', runStatus) ?
          <Segment placeholder>
            <Header icon>
              <Icon name='exclamation' />
              Submit your run to compute results
            </Header>
          </Segment>
        : R.equals('submitted', runStatus) ?
          <Segment placeholder>
            <Header icon>
              <Icon name='exclamation' />
              You will be notified when your run is completed
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
                      <Step key={index}
                        onClick={() => setActiveResult(result)}
                      >
                        {
                          isActiveResult(result)
                          && <Icon name='eye' color='violet'/>
                        }
                        <Step.Content title={label} description={description} />
                      </Step>
                    )
                  )
                )(R.values(availablePlots))
              }
              </Step.Group>
            ),
            R.always(
              <Segment>
                <Button color='violet' fluid onClick={() => setActiveResult(null)} animated='fade'>
                  <Button.Content visible>
                  {
                    R.compose(
                      R.prop('label'),
                      R.find(R.propEq('result', activeResult))
                    )(R.values(availablePlots))
                  }
                  </Button.Content>
                  <Button.Content hidden>
                    <Icon name='angle left' />
                    Click to go back
                  </Button.Content>
                </Button>
                <Divider />
                <VisualizationMenu/>
              </Segment>
            )
          )(activeResult)
        }
        </>
      )
    
  }
)

export default ResultsSidebar