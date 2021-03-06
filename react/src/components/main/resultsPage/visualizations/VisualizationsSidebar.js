import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Step, Header, Dropdown, Form, Divider, Menu, Label, Popup } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {useResultsAvailableQuery} from '../../../../apollo/hooks/results'
import {setActiveResult, addPlot, setActivePlot} from '../../../../redux/actions/resultsPage'

import VisualizationMenu from '../../resultsPage/visualizations/VisualizationMenu'
import DotPlotVisualizationMenu from '../../resultsPage/visualizations/DotPlotVisualizationMenu'
import HeatmapVisualizationMenu from '../../resultsPage/visualizations/HeatmapVisualizationMenu'
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
            <Menu.Item key={idx} active={R.equals(activePlot, idx)} content={R.inc(idx)}
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
  
  const DetailedDescription = () => {
    const plot = R.find(({result}) => result === activeResult, plots)
    return R.isNil(plot) ? <></> : <p>{plot.detailedDescription}</p>
  }

  if (R.any(R.isNil, [run, plots])) {
    return null
  }
  const {status: runStatus} = run
  const runStatusEquals = R.equals(runStatus)
  if (runStatusEquals('failed')) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name='times circle' />
          The pipeline has failed.
        </Header>
      </Segment>
    )
  }

  return (
    <>
    {
      R.isNil(activeResult) ? (
        <Step.Group vertical fluid size='small'>
        {
          R.ifElse(
            R.isEmpty,
            R.always(<Step key={"noresults"}><Step.Content title={"No Results Available"} description={"Check logs above to see progress. Refresh to see available results."}/></Step>),
            R.addIndex(R.map)(
              ({result, label, description}, index) => (
                <Step key={index} onClick={() => dispatch(setActiveResult({result}))} >
                  {isActiveResult(result) && <Icon name='eye' color='violet'/>}
                  <Step.Content title={label} description={description} />
                </Step>
              )
            )
          )(plots)
        }
        </Step.Group>
      ) : (
        <>
          <MultiPlotSelector />
          <Segment as={Form} attached>
            <Divider horizontal content='Plots' />
            <Form.Group>
              <Form.Field width={16}>
                <Dropdown fluid selection labeled
                  value={activeResult}
                  options={R.compose(R.map(({result, label, description}) => ({key: result, value: result, text: label})))(plots)}
                  onChange={(e, {value}) => dispatch(setActiveResult({result: value}))}
                />
              </Form.Field>
              <Popup
                trigger={ 
                  <Button icon >
                    <Icon name='help circle'/>
                  </Button>
                }
                content={
                  <>
                    <DetailedDescription/>
                    <Button icon style={{padding:'5px'}} fluid>
                      <a target="_blank" href={`https://pughlab.github.io/crescent-frontend/#item-4-${R.equals(activeResult, 'qc') ? "1" : "2"}`} style={{textDecoration: 'none', color: "inherit"}}>
                        Go to documentation
                        <Icon name='external'/>
                      </a>
                    </Button>
                  </>
                }
                hoverable
                wide
              />
            </Form.Group>
          </Segment>
          <Segment attached='bottom'>
            {
              R.cond([
                [R.equals('qc'),   R.always(<QualityControlMenu/>)],
                [R.equals('dot'), R.always(<DotPlotVisualizationMenu/>)],
                [R.equals('heatmap'), R.always(<HeatmapVisualizationMenu/>)],
                [R.T,            R.always(<VisualizationMenu/>)]
              ])(activeResult)
            }
          </Segment>
        </>
      )
    }
    </>
  )
}

export default VisualizationsSidebar