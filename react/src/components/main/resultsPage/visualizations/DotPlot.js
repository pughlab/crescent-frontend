import React, { useState, useEffect, useCallback } from 'react'
import { Machine, interpret, assign } from 'xstate';
import { useMachine, useService } from '@xstate/react';
import Plot from 'react-plotly.js'
import { Image, Container, Header, Segment, Dimmer, Icon, Popup, Dropdown, Grid, Button } from 'semantic-ui-react'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import { ClimbingBoxLoader } from 'react-spinners'
import Shake from 'react-reveal/Shake'

import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../../redux/hooks/useResultsPage'
import { useResultsAvailableQuery, useDotPlotQuery } from '../../../../apollo/hooks/results'
import { addSelectedFeature, setSelectedScaleBy, setSelectedExpRange } from '../../../../redux/actions/resultsPage'

// cache dot plot data in form of { "gene": plotlyObj }
let dotPlotData = {}

// constants
const violet = '#6435c9'
const lightViolet = '#c5b3eb'
const grey = '#a1a1a2'

export const dotPlotMachine = Machine({
  id: 'dotPlotMachine',
  initial: 'idle',
  context: {
    dotPlotMachineData: []
  },
  states: {
    idle: {
      on: {
        CHANGE_PARAMETER: 'initialLoading',
        CLEAR_GENES: 'idle'
      }
    },
    initialLoading: {
      on: {
        SUCCESS: {
          target: "complete",
          actions: 
            assign({
              dotPlotMachineData: ({dotPlotMachineData}, {type, data}) => { 
                return [...data]
              }
            })
        },
        FAIL: 'failure'
      }
    },
    complete: {
      on:{
        CHANGE_PARAMETER: 'dataLoading',
        CLEAR_GENES: 'idle'
      }
    },
    dataLoading: {
      on: {
        SUCCESS: {
          target: "complete",
          actions: 
            assign({
              dotPlotMachineData: ({dotPlotMachineData}, {type, data}) => { 
                return [...data]
              }
            })
        },
        FAIL: 'failure'
      }
    },
    failure: {
      type: 'final'
    }
  }
})
const service = interpret(dotPlotMachine).start();
export const useDotPlotMachine = () => {
  
  return useService(service);
}


const DotPlot = ({
  plotQueryIndex
}) => {
  const { runID } = useCrescentContext()

  const dispatch = useDispatch()
  const { activeResult, selectedFeature, selectedFeatures, selectedGroup, selectedDiffExpression, selectedScaleBy, selectedExpRange, selectedAssay } = useResultsPagePlotQuery(plotQueryIndex)
  const { sidebarCollapsed } = useResultsPage()

  const plots = useResultsAvailableQuery(runID)
  const [current, send] = useDotPlotMachine()

  useDotPlotQuery(selectedFeatures, selectedGroup, runID, selectedScaleBy, selectedExpRange, selectedAssay, sidebarCollapsed)
 
  if (R.any(R.isNil, [plots])) {
    return null
  }

  //if no feature is selected, ask the user to select one 
  if(current.matches('idle')){
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <div>
      {current.value}
    </div>
        <Shake forever duration={10000}>
          <Header textAlign='center' icon>
            <Icon name='right arrow' />
            Select a gene to initialize dot plot
          </Header>
        </Shake>
      </Segment>
    )
  }
  //plot is rendering
  if(current.matches('initialLoading')){
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>)
  }

  // determine proper name of active plot
  const currentScatterPlotType = R.compose(
    R.prop('label'),
    R.find(R.propEq('result', activeResult)),
  )(plots)

  const getDotSizes = (percentages, dotMinMax) =>  percentages.map(percentage => percentage * (dotMinMax[1] - dotMinMax[0]) + dotMinMax[0])
  const sizeLegend = [{
    x: [1, 2, 3, 4, 5],
    y: [1, 1, 1, 1, 1],
    text: ['<b>0%</b>', '<b>25%</b>', '<b>50%</b>', '<b>75%</b>', '<b>100%</b>'],
    mode: 'markers+text',
    textposition: 'center left',
    marker: {
      size: getDotSizes([0, .25, .5, .75, 1], current.context.dotPlotMachineData[0]["dotminmax"]),
      color: '#f5527b'
    }
  }];

  // stringify y values. (When there's only one y value, 
  // if the value is a number, there will be a rendering error)
  const stringifyYValues = (plot) => {
    return plot.map(trace => {
    return { ...trace, y: trace.y.map(yValue => yValue + " ") }
  })
  }

  // make the plot smaller when there's less groups
  let plotHeight = "85%"
  if (R.not(R.isEmpty(current.context.dotPlotMachineData)) && current.context.dotPlotMachineData[0]["y"].length <= 5) {
    plotHeight = "60%"
  }

  let possibleMaxExp = 100
  if (R.not(R.isEmpty(current.context.dotPlotMachineData))) {
    possibleMaxExp = Math.ceil(current.context.dotPlotMachineData[0]["globalmax"] * 10) / 10
  }
  
  let initialRange = [0,0]
  if (R.not(R.isEmpty(current.context.dotPlotMachineData))) {
    initialRange = current.context.dotPlotMachineData[0]["initialminmax"].map(num => Math.round(num * 10) / 10)
  }

  const SliderWithTooltip = createSliderWithTooltip(Slider.Range);
  const getColor = () => selectedScaleBy === "gene" ? grey : violet
  return (
    // <Dimmer.Dimmable dimmed={isLoading} style={{height:'100%'}}>
    // <Dimmer active={isLoading} inverted>
    //   <ClimbingBoxLoader color='#6435c9' />
    // </Dimmer>
    // <Segment style={{height: '100%'}}>
    <>
    {/* <div>
      {current.value}
    </div> */}
      <Header textAlign='center' content={currentScatterPlotType} />
      <Segment basic loading={current.matches('dataLoading')} style={{ height: '100%' }}>

      { sidebarCollapsed ||
        (
          <Grid divided='vertically'>
            <Grid.Row columns={3}>
              <Grid.Column textAlign="center" verticalAlign="middle" width={selectedScaleBy == "matrix" ? 5 : 7}>
                <Header size='small' style={{ display: "inline", paddingRight: "10px" }}>Scale By: </Header>
                <Dropdown
                  key={`dropdown-${plotQueryIndex}`}
                  selection
                  defaultValue={selectedScaleBy}
                  onChange={(e, { value }) => {send({type: "CHANGE_PARAMETER"}); dispatch(setSelectedScaleBy({ value }))}}
                  options={[{ text: "gene", value: "gene" },
                  { text: "matrix", value: "matrix" }]}
                />
              </Grid.Column>
              <Grid.Column verticalAlign="middle" width={9}>
                  <div style={{ display: 'flex', justifyContent: "center", alignContent: "center" }}>
                  {selectedScaleBy !== "matrix" || (
                    <>
                      <Header size='small' style={{ margin: 0 }}>
                        Gene Expression Range:
                      </Header>
                      <SliderWithTooltip
                        key={`slider-${plotQueryIndex}`}
                        min={0}
                        max={possibleMaxExp}
                        step={0.1}
                        marks={{ 0: 0, [possibleMaxExp]: possibleMaxExp }}
                        allowCross={false}
                        disabled={selectedScaleBy === "gene"}
                        style={{ maxWidth: "300px", margin: "auto", marginBottom: "10px" }}
                        trackStyle={[{ backgroundColor: getColor() }]}
                        handleStyle={[{ backgroundColor: getColor(), border: "none", boxShadow: "none" }, { backgroundColor: getColor(), border: "none", boxShadow: "none" }]}
                        railStyle={{ backgroundColor: lightViolet }}
                        // defaultValue={R.equals(selectedExpRange, [0, 0]) ? [0, possibleMaxExp] : selectedExpRange}
                        defaultValue={R.equals(selectedExpRange, [0, 0]) ? initialRange : selectedExpRange}
                        onAfterChange={(value) => {send({type: "CHANGE_PARAMETER"}); dispatch(setSelectedExpRange({ value })); }}
                      />
                    </>
                                    )}

                  </div>
              </Grid.Column>
              <Grid.Column textAlign="center" verticalAlign="middle" width={2}>
                {selectedScaleBy !== "matrix" || (

                  <Button.Group fluid widths={2} size='mini'>
                    <Popup inverted size='tiny'
                      trigger={
                        <Button color='violet' icon='chart area'
                          onClick={() => {send({type: "CHANGE_PARAMETER"}); dispatch(setSelectedExpRange({ value: initialRange }))}}
                          disabled={selectedScaleBy === "gene"}

                        />
                      }
                      content={
                        'Set Gene Expression Range to 10th/90th Percentiles'
                      }
                    />
                    <Popup inverted size='tiny'
                      trigger={
                        <Button basic color='violet' icon='balance scale'
                          onClick={() => {send({type: "CHANGE_PARAMETER"}); dispatch(setSelectedExpRange({ value: [0, possibleMaxExp] }))}}
                          disabled={selectedScaleBy === "gene"}
                        />
                      }
                      content={
                        'Set Gene Expression Range to Min/Max'
                      }
                    />
                  </Button.Group>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )
      }

        <Plot
          data={sizeLegend}
          style={{ width: '100%', height: 60 }}
          layout={{
            showlegend: false,
            margin: { l: 100, r: 100, b: 0, t: 0 },
            xaxis: {
              visible: false
            },
            yaxis: {
              visible: false
            },
          }}
          config={{
            displayModeBar: false,
            staticPlot: true
          }}
        />
        <Plot
          config={{ showTips: false }}
          data={stringifyYValues(current.context.dotPlotMachineData)}
          useResizeHandler
          style={{ width: '100%', height: plotHeight }}
          layout={{
            autosize: true,
            hovermode: 'closest',
            hoverlabel: { bgcolor: "#FFF" },
            margin: { l: 50, r: 30, b: 50, t: 20 },
            legend: { "orientation": "v" },
            showlegend: false,
            xaxis: {
              title: 'Genes',
              showline: true,
              showgrid: true,
              autorange: true,
              automargin: true,
              type: 'category',
              categoryorder: 'array',
            },
            yaxis: {
              title: 'Cluster Groups',
              showline: true,
              showgrid: true,
              autorange: true,
              automargin: true,
              type: 'category',
              categoryorder: 'array',
            },
            hovermode: 'closest'
          }}
        />
        {/* </Dimmer.Dimmable> */}
      </Segment>
    </>
  )
}

export default DotPlot
