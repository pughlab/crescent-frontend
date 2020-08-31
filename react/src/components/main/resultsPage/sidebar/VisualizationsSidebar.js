import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Step, Header, Dropdown, Form, Divider, Menu, Label } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery, useResultsAvailableQuery} from '../../../../apollo/hooks'
import {setActiveResult, addPlot, setActivePlot} from '../../../../redux/actions/resultsPage'

import VisualizationMenu from '../../resultsPage/visualizations/VisualizationMenu'
import QualityControlMenu from '../../resultsPage/visualizations/QualityControlMenu'

const MultiPlotSelector = ({

}) => {
  const [numPlots, setNumPlots] = useState(1)
  
  const dispatch = useDispatch()
  const {activePlot, plotQueries} = useResultsPage()

  return (
    <Menu attached='top' color='violet'>
      {
        R.compose(
          R.addIndex(R.map)((plot, idx) => (
            <Menu.Item active={R.equals(activePlot, idx)} content={R.inc(idx)}
              onClick={() => dispatch(setActivePlot({value: idx}))}
            />
          ))
        )(plotQueries)
      }
      <Menu.Item icon='plus' onClick={() => dispatch(addPlot())} />
    </Menu>
  )
}

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
  const {status: runStatus, datasets} = run

  // SINGLE DATASET QC METRICS/QC AVAILABLE UNTIL SIDE MENU REFACTOR!
  const datasetID = R.compose(R.prop(0), R.pluck('datasetID'))(datasets)
  console.log('datsetID', datasetID)

  // const {} = run
  // console.log('run status:')
  // console.log(runStatus)

  console.log('DATASETS: ', datasets)


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
                    <Step key={index} onClick={() => dispatch(setActiveResult({result}))} >
                      {
                        isActiveResult(result)
                        && <Icon name='eye' color='violet'/>
                      }
                      <Step.Content title={label} description={description} />
                    </Step>
                  )
                )
              )(plots)
            }
            </Step.Group>
          ),
          R.always(
            <>
              <MultiPlotSelector />

              <Segment as={Form} attached>
                <Divider horizontal content='Plots' />
                <Form.Field>
                  <Dropdown fluid selection labeled
                    value={activeResult}
                    options={R.compose(
                      R.map(({result, label, description}) => ({key: result, value: result, text: description}))
                    )(plots)}
                    onChange={(e, {value}) => dispatch(setActiveResult({result: value}))}
                  />
                </Form.Field>
              </Segment>
              <Segment attached='bottom'>
                {
                  R.ifElse(
                    R.equals('qc'),
                    R.always(<QualityControlMenu />),
                    R.always(<VisualizationMenu/>)
                  )(activeResult)
                }
              </Segment>
            </>
          )
        )(activeResult)
      }
      </>
    )
}

export default VisualizationsSidebar