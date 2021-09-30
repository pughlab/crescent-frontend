import React, {useEffect} from 'react';

import { Segment, Button, Icon, Step, Header, Dropdown, Form, Divider, Menu, Label, Popup } from 'semantic-ui-react'
import * as R from 'ramda'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery, useSavePlotQueryMutation, useRemoveSavedPlotQueryMutation, useUpdateSavedPlotQueryMutation} from '../../../../apollo/hooks/run'
import {useResultsAvailableQuery} from '../../../../apollo/hooks/results'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage';
import {setActiveResult, addEmptyPlot, setActivePlot, setPlotQueryID} from '../../../../redux/actions/resultsPage'
import {updatePlot} from '../../../../redux/actions/comparePage'

import VisualizationMenu from '../../resultsPage/visualizations/VisualizationMenu'
import DotPlotVisualizationMenu from '../../resultsPage/visualizations/DotPlotVisualizationMenu'
import GSVAHeatmapVisualizationMenu from '../../resultsPage/visualizations/GSVAHeatmapVisualizationMenu'
import QualityControlMenu from '../../resultsPage/visualizations/QualityControlMenu'
import InferCNVHeatmapVisualizationMenu from './InferCNVHeatmapVisualizationMenu';

import { plotQueryFields } from '../../../../utils';

const MultiPlotSelector = ({
  runID,
  runOwner
}) => {
  const dispatch = useDispatch()
  const {userID} = useCrescentContext()
  const {activePlot, plotQueries} = useResultsPage()
  const {plotQueryID} = useResultsPagePlotQuery(activePlot)
  const {savePlotQuery, loading: savePlotQueryLoading} = useSavePlotQueryMutation(
    runID, 
    R.compose(
      R.over(R.lensProp('selectedExpRange'), R.map(num => num.toString()), R.__),
      R.pick(plotQueryFields),
    )(plotQueries[activePlot]),
    (id) => dispatch(setPlotQueryID({value: id}))
  )
  const { removeSavedPlotQuery, loading: removePlotQueryLoading } = useRemoveSavedPlotQueryMutation(runID, plotQueryID, () => dispatch(setPlotQueryID({value: null})))
  const { updateSavedPlotQuery, loading: updatePlotQueryLoading } = useUpdateSavedPlotQueryMutation({
    runID,
    input: R.compose(
      R.over(R.lensProp('selectedExpRange'), R.map(num => num.toString()), R.__),
      R.pick(plotQueryFields),
    )(plotQueries[activePlot]),
    onComplete: plotQuery => dispatch(updatePlot({plotQuery}))
    })

  const PlotSavingButtons = () => {
    return plotQueryID ? (
      <Button.Group fluid attached="bottom">
        <Button color='violet' animated='vertical' style={{borderRadius: 0}} onClick={updateSavedPlotQuery} loading={updatePlotQueryLoading}>
          <Button.Content visible><Icon name='sync'/></Button.Content>
          <Button.Content hidden content="Update saved plot"/>
        </Button>
        <Button color='red' animated='vertical'  style={{borderRadius: 0}} onClick={removeSavedPlotQuery} loading={removePlotQueryLoading}>
          <Button.Content visible><Icon name='trash'/></Button.Content>
          <Button.Content hidden content="Remove plot"/>
        </Button>
      </Button.Group>
    ) : (
      <Button color="violet" animated='vertical' fluid style={{borderRadius: 0}} onClick={savePlotQuery} loading={savePlotQueryLoading}>
        <Button.Content visible><Icon name='save'/></Button.Content>
        <Button.Content hidden content="Save plot"/>
      </Button>
    )
  }

  return (
    <>
      <Menu attached='top' color='violet'>
        {
          R.compose(
            R.addIndex(R.map)((plot, idx) => (
              <Menu.Item key={idx} active={R.equals(activePlot, idx)} onClick={() => dispatch(setActivePlot({value: idx}))}>
                {R.inc(idx)}
                {plot.plotQueryID && (
                  <Label floating color="violet" style={{ paddingRight: 0, paddingLeft: "-9px" }} icon={<Icon name='pin'/>}/>
                )}
              </Menu.Item>
            ))
          )(plotQueries)
        }
        <Menu.Item icon='plus' onClick={() => dispatch(addEmptyPlot())} />
      </Menu>
      {
        R.equals(runOwner, userID) && (<PlotSavingButtons />)
      }
      
    </>
  )
}

const VisualizationsSidebar = () => {    
  const {runID} = useCrescentContext()
  const {runStatus} = useResultsPage()
  const {run} = useRunDetailsQuery(runID)

  const dispatch = useDispatch()
  const {activeResult} = useResultsPage()
  const isActiveResult = R.equals(activeResult)

  const {plots, startResultsPolling, stopResultsPolling} = useResultsAvailableQuery(runID)

  useEffect(() => {
    startResultsPolling(1000)
  }, [startResultsPolling])

  useEffect(() => {
    if (R.none(R.equals(runStatus), ['pending', 'submitted'])) stopResultsPolling()
  }, [runStatus, stopResultsPolling])
  
  const DetailedDescription = () => {
    const plot = R.find(({result}) => result === activeResult, plots)
    return R.isNil(plot) ? <></> : <p>{plot.detailedDescription}</p>
  }

  if (R.any(R.isNil, [run, plots])) {
    return null
  }
  const {createdBy: {userID: runOwner}} = run
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
            R.always(<Step key={"noresults"}><Step.Content title={"No Results Available"} description={"Check logs above to see progress. Results will auto-populate as they become available."}/></Step>),
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
          <MultiPlotSelector {...{runID, runOwner}}/>
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
                [R.equals('gsva'), R.always(<GSVAHeatmapVisualizationMenu/>)],
                [R.equals('infercnv'), R.always(<InferCNVHeatmapVisualizationMenu/>)],
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