import React, { useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import { Image, Container, Header, Segment, Dimmer, Icon, Popup, Dropdown, Grid, Button } from 'semantic-ui-react'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import { ClimbingBoxLoader } from 'react-spinners'
import Shake from 'react-reveal/Shake'
import PlotHeader from './PlotHeader';

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

const DotPlot = ({
  plotQueryIndex
}) => {
  const { runID, view } = useCrescentContext()

  const dispatch = useDispatch()
  const { activeResult, selectedFeatures, selectedGroup, selectedScaleBy, selectedExpRange, selectedAssay, runID: compareRunID, plotQueryID } = useResultsPagePlotQuery(plotQueryIndex)
  const { sidebarCollapsed } = useResultsPage()

  const plots = useResultsAvailableQuery(runID || compareRunID)

  const [resetSliderValues, setResetSliderValues] = useState(true)
  const inMultiPlot = sidebarCollapsed || R.equals(view, 'compare')

  let dotPlot = [] //list of dot plot plotly object
  let queryGenes = [] //list of genes to send along the query

  // for all the selected genes, if cached and in the selected group then add to dotPlot, 
  // else need to include in query
  R.forEach((gene) => {
    if (R.includes(gene, Object.keys(dotPlotData))
      && dotPlotData[gene]["group"] === selectedGroup
      && dotPlotData[gene]["scaleby"] === selectedScaleBy
      && dotPlotData[gene]["sidebarcollapsed"] === sidebarCollapsed
      && selectedScaleBy === "gene") {
      dotPlot = R.append(dotPlotData[gene], dotPlot)
    } else {
      queryGenes = R.append(gene, queryGenes)
    }
  }, selectedFeatures)
  const { dotPlot: queryResult, loading } = useDotPlotQuery(queryGenes, selectedGroup, runID || compareRunID, selectedScaleBy, selectedExpRange, selectedAssay, inMultiPlot)
  const result = queryResult === null ? [] : queryResult.filter(trace => trace["group"] === selectedGroup && trace["scaleby"] === selectedScaleBy)
  dotPlot = R.concat(dotPlot, result)


  // useEffect(() => {
  //   if((R.not(R.isNil(queryResult) || R.isEmpty(queryResult))) && resetSliderValues){
  //     const initialRange = queryResult[0]["initialminmax"].map(num => Math.round(num * 10) / 10)
  //     if(R.not(R.equals(selectedExpRange, initialRange))){
  //       dispatch(setSelectedExpRange({value: initialRange}))
  //       setResetSliderValues(false)
  //     }
  //   }
  // }, [queryResult])

  // useEffect(() => { // when selected features change, reset the default slider value
  //   setResetSliderValues(true)
  // }, [selectedFeatures])

  // useEffect(() => { // when sidebarCollapsed changes, the selectedFeatures will get reset, 
  //                   // so need to set state to false
  //   setResetSliderValues(false)
  // }, [sidebarCollapsed])

  // const scatter = useScatterQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  // const scatterNumeric = useScatterNumericQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  // const opacity = useOpacityQuery(activeResult, selectedFeature, selectedGroup, runID, selectedDiffExpression)
  // const numericGroups = useNumericGroupsQuery(runID, selectedDiffExpression)

  if (R.any(R.isNil, [plots])) {
    return null
  }

  //if no feature is selected, ask the user to select one 
  if (R.isEmpty(selectedFeatures)) {
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
  if (R.isNil(queryResult) || (R.not(R.isEmpty(queryGenes)) && R.isEmpty(dotPlot))) {
    return (
      <Segment basic style={{ height: '100%' }} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>)
  }
  const isLoading = false

  // cache plot data to dotPlotData
  // cannot cache if scaleBy is "matrix" because we need to recalculate the max avg exp
  R.forEach((trace) => {
    if (trace["scaleby"] === "gene") {
      dotPlotData[trace.x[0]] = trace
    }
  }, dotPlot)

  // determine proper name of active plot
  const currentScatterPlotType = R.compose(
    R.prop('label'),
    R.find(R.propEq('result', activeResult)),
  )(plots)

  const addColorScale = (data) => {
    if (R.not(R.isEmpty(data))) {
      data[0]["marker"]["colorscale"] = [[0, '#fbf4f5'], [1, '#f5527b']];
      data[0]["marker"]["showscale"] = true;
    }
    return data
  }

  const getDotSizes = (percentages, dotMinMax) =>  percentages.map(percentage => percentage * (dotMinMax[1] - dotMinMax[0]) + dotMinMax[0])
  const sizeLegend = [{
    x: [1, 2, 3, 4, 5],
    y: [1, 1, 1, 1, 1],
    text: ['<b>0%</b>', '<b>25%</b>', '<b>50%</b>', '<b>75%</b>', '<b>100%</b>'],
    mode: 'markers+text',
    textposition: 'center left',
    marker: {
      size: getDotSizes([0, .25, .5, .75, 1], dotPlot[0]["dotminmax"]),
      color: '#f5527b'
    }
  }];

  // stringify y values. (When there's only one y value, 
  // if the value is a number, there will be a rendering error)
  dotPlot = dotPlot.map(trace => {
    return { ...trace, y: trace.y.map(yValue => yValue + " ") }
  })

  // make the plot smaller when there's less groups
  let plotHeight = "85%"
  if (R.not(R.isEmpty(dotPlot)) && dotPlot[0]["y"].length <= 5) {
    plotHeight = "60%"
  }

  let possibleMaxExp = 100
  if (R.not(R.isEmpty(result))) {
    possibleMaxExp = Math.ceil(result[0]["globalmax"] * 10) / 10
  }
  
  let initialRange = [0,0]
  if (R.not(R.isEmpty(result))) {
    initialRange = result[0]["initialminmax"].map(num => Math.round(num * 10) / 10)
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
      <PlotHeader {...{plotQueryID}} name={currentScatterPlotType} runID={runID || compareRunID} />
      <Segment basic loading={loading} style={{ height: '100%' }}>
        <>
          { inMultiPlot ||
            (
              <Grid divided='vertically'>
                <Grid.Row columns={3}>
                  <Grid.Column textAlign="center" verticalAlign="middle" width={selectedScaleBy == "matrix" ? 5 : 7}>
                    <Header size='small' style={{ display: "inline", paddingRight: "10px" }}>Scale By: </Header>
                    <Dropdown
                      key={`dropdown-${plotQueryIndex}`}
                      selection
                      defaultValue={selectedScaleBy}
                      onChange={(e, { value }) => dispatch(setSelectedScaleBy({ value }))}
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
                            onAfterChange={(value) => { dispatch(setSelectedExpRange({ value })); }}
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
                              onClick={() => dispatch(setSelectedExpRange({ value: initialRange }))}
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
                              onClick={() => dispatch(setSelectedExpRange({ value: [0, possibleMaxExp] }))}
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
              useResizeHandler
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
              data={dotPlot}
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
        </>
      </Segment>
    </>
  )
}

export default DotPlot
