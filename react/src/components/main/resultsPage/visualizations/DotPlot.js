import React, { useEffect, useRef, useState } from 'react'
import ResponsivePlot, {ResponsivePlotSegment} from './ResponsivePlot'
import { Image, Container, Header, Segment, Dimmer, Icon, Popup, Dropdown, Grid, Button } from 'semantic-ui-react'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import Shake from 'react-reveal/Shake'
import { useService } from '@xstate/react';
import PlotHeader from './PlotHeader';

import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../../redux/hooks/useResultsPage'
import { useResultsAvailableQuery, useDotPlotQuery } from '../../../../apollo/hooks/results'
import { setSelectedScaleBy, setSelectedExpRange } from '../../../../redux/actions/resultsPage'

// constants
const violet = '#6435c9'
const lightViolet = '#c5b3eb'
const grey = '#a1a1a2'

const DotPlot = ({
  plotQueryIndex
}) => {
  const { runID, view } = useCrescentContext()

  const dispatch = useDispatch()
  const { activeResult, selectedFeatures, selectedGroup, selectedScaleBy, selectedExpRange, selectedAssay, runID: compareRunID, plotQueryID, service } = useResultsPagePlotQuery(plotQueryIndex)
  const { sidebarCollapsed, activePlot } = useResultsPage()

  const {plots} = useResultsAvailableQuery(runID || compareRunID)
  const [current, send] = useService(service)
  
  const firstUpdate = useRef(true);
  const [resetSliderValues, setResetSliderValues] = useState(true)
  const inMultiPlot = sidebarCollapsed || R.equals(view, 'compare')

  useDotPlotQuery(selectedFeatures, selectedGroup, runID || compareRunID , selectedScaleBy, selectedExpRange, selectedAssay, inMultiPlot, plotQueryIndex)

  useEffect(() => {
    // do not run on first render when sidebar not collapsed
    if (firstUpdate.current && !sidebarCollapsed) {
      firstUpdate.current = false
      return
    }
    if(!(R.test(/multiPlot.*/, current.value) && sidebarCollapsed)) send({type: "COLLAPSE_SIDEBAR"})
  }, [sidebarCollapsed])

  useEffect(() => {
    if(!(R.test(/multiPlot.*/, current.value) && sidebarCollapsed)) send({type: "CHANGE_ACTIVE_PLOT"})
  }, [activePlot])

  if (R.any(R.isNil, [plots])) {
    return null
  }

  //if no feature is selected, ask the user to select one 
  if (current.matches('idle')) {
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
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
  if (current.matches('initialLoading')) {
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>)
  }

  const { plotData } = current.context

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
      size: getDotSizes([0, .25, .5, .75, 1], plotData[0]["dotminmax"]),
      color: '#f5527b'
    }
  }];

  // stringify y values. (When there's only one y value, 
  // if the value is a number, there will be a rendering error)
  const stringifyYValues = (data) => data.map(trace => ({ ...trace, y: trace.y.map(yValue => yValue + " ") }))

  let possibleMaxExp = 100
  if (R.not(R.isEmpty(plotData))) {
    possibleMaxExp = Math.ceil(plotData[0]["globalmax"] * 10) / 10
  }
  
  let initialRange = [0,0]
  if (R.not(R.isEmpty(plotData))) {
    initialRange = plotData[0]["initialminmax"].map(num => Math.round(num * 10) / 10)
  }

  const SliderWithTooltip = createSliderWithTooltip(Slider.Range);
  const getColor = () => selectedScaleBy === "gene" ? grey : violet
  return (
    <>
      <PlotHeader {...{plotQueryID}} name={currentScatterPlotType} runID={runID || compareRunID} />
      <ResponsivePlotSegment
        loading={R.test(/.*Loading/, current.value)}
        style={{minHeight: 260}}
      >
      { !inMultiPlot &&
        (
          <Grid divided='vertically'>
            <Grid.Row columns={3}>
              <Grid.Column textAlign="center" verticalAlign="middle" width={selectedScaleBy == "matrix" ? 5 : 7}>
                <Header size='small' style={{ display: "inline", paddingRight: "10px" }}>Scale By: </Header>
                <Dropdown
                  key={`dropdown-${plotQueryIndex}`}
                  selection
                  defaultValue={selectedScaleBy}
                  onChange={(e, { value }) => dispatch(setSelectedScaleBy({ value, send }))}
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
                        onAfterChange={(value) => { dispatch(setSelectedExpRange({ value, send })); }}
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
                          onClick={() => dispatch(setSelectedExpRange({ value: initialRange, send }))}
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
                          onClick={() => dispatch(setSelectedExpRange({ value: [0, possibleMaxExp], send }))}
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

        <ResponsivePlot
          data={sizeLegend}
          style={{height: 60}}
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
        <ResponsivePlot
          automargin
          config={{ showTips: false }}
          data={stringifyYValues(plotData)}
          style={{height: 'calc(100% - 60px)'}}
          layout={{
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
              type: 'category',
              categoryorder: 'array',
            },
            yaxis: {
              title: 'Cluster Groups',
              showline: true,
              showgrid: true,
              autorange: true,
              type: 'category',
              categoryorder: 'array',
            },
            hovermode: 'closest'
          }}
        />
      </ResponsivePlotSegment>
    </>
  )
}

export default DotPlot
