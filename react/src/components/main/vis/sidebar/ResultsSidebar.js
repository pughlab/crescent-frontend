import React, { useEffect } from 'react';

import { Segment, Button, Icon, Step, Header } from 'semantic-ui-react'
import * as R from 'ramda'

import withRedux from '../../../../redux/hoc'
import VisualizationMenu from '../results/VisualizationMenu';
import QualityControlMenu from '../results/QualityControlMenu'

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
        fetchTopExpressed,
        clearResults
      }
    },
  }) => {
    useEffect(() => {
      initializeResults(runID)
      fetchTopExpressed(runID)
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
              <Segment.Group>
                <Button color='violet' fluid  animated='vertical' attached='top'
                  onClick={() => setActiveResult(null)}
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
)

export default ResultsSidebar
