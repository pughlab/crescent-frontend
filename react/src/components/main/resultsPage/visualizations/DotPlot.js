import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Image, Container, Header, Segment, Dimmer, Icon} from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import Shake from 'react-reveal/Shake'

import * as R from 'ramda'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useResultsAvailableQuery, useDotPlotQuery} from '../../../../apollo/hooks'
import { addSelectedFeature } from '../../../../redux/actions/resultsPage'

//cache dot plot data in form of { "gene": plotlyObj }
let dotPlotData = {}

const DotPlot = ({
  plotQueryIndex
}) => {
  const {runID} = useCrescentContext()
  
  const dispatch = useDispatch()
  const {activeResult, selectedFeature, selectedFeatures, selectedGroup, selectedDiffExpression} = useResultsPagePlotQuery(plotQueryIndex)

  const plots = useResultsAvailableQuery(runID)
  const [addedFeatures, setAddedFeatures] = useState(false)

  let dotPlot = [] //list of dot plot plotly object
  let queryGenes = [] //list of genes to send along the query
  // for all the selected genes, if cached add to dotPlot, else need to include in query
  R.forEach((gene)=> {
    if (R.includes(gene, Object.keys(dotPlotData))){
      dotPlot = R.append(dotPlotData[gene], dotPlot)
    }else{
      queryGenes = R.append(gene, queryGenes)
    }
  }, selectedFeatures)
  const queryResult = useDotPlotQuery(R.and(R.isEmpty(queryGenes), addedFeatures) ? ["none"] : queryGenes, runID)
  dotPlot = R.concat( dotPlot, queryResult === null ? []: queryResult)
  
  useEffect(() => {
    //add the default features to selectedFeatures when the plot first renders and selectedFeatures is empty
    if (R.and(R.not(R.isEmpty(dotPlot)), R.not(addedFeatures))) {
      R.map((trace)=>{
      const value = trace.x[0]
      if (R.not(R.includes(value, selectedFeatures))){
        dispatch(addSelectedFeature({value}))
      }
      setAddedFeatures(true)
    },dotPlot)}
  }, [dotPlot])
  // const scatter = useScatterQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  // const scatterNumeric = useScatterNumericQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  // const opacity = useOpacityQuery(activeResult, selectedFeature, selectedGroup, runID, selectedDiffExpression)
  // const numericGroups = useNumericGroupsQuery(runID, selectedDiffExpression)

  if (R.any(R.isNil, [plots])) {
    return null
  }

  //if no feature is selected, ask the user to select one 
  if (R.equals(selectedFeatures, ["none"])) {
      return (
        <Segment basic style={{height: '100%'}} placeholder>
          <Shake forever duration={10000}>
          <Header textAlign='center' icon>
            <Icon name='right arrow' />
            Select a feature to initialize dot plot
          </Header>  
          </Shake>      
        </Segment>
      )
    }

  //plot with the default genes is rendering
  if(R.and(R.isEmpty(dotPlot), R.isEmpty(selectedFeatures))){
    return (
    <Segment basic style={{height: '100%'}} placeholder>
      <Tada forever duration={1000}>
        <Image src={Logo} centered size='medium' />
      </Tada>
    </Segment>)
    }

  const isLoading = false
  
  //cache plot data to dotPlotData
  R.forEach((trace) => {
      dotPlotData[trace.x[0]] = trace
    }, dotPlot)

  // determine proper name of active plot
  const currentScatterPlotType = R.compose(
    R.prop('label'),
    R.find(R.propEq('result', activeResult)),
  )(plots)

  const addColorScale = (data) => {
    if(R.not(R.isEmpty(data))){
      data[0]["marker"]["colorscale"] = [[0, '#fbf4f5'],[1, '#f5527b']];
      data[0]["marker"]["showscale"] = true;
    }
    return data
  }
  const getGenes = (data) => {
    return R.reduce((genes, trace) => {
      genes.push(trace.x[0])
      return genes
    }, [], data)
  }
  const getClusters = (data) => {
    return R.reduce((clusters, trace) => {
      clusters.push(trace.y[0])
      return clusters
    }, [],data)
  }

  var sizeLegend = [{
    x: [1, 2, 3, 4, 5],
    y: [1, 1, 1, 1, 1],
    text : ['<b>0%</b>','<b>25%</b>','<b>50%</b>','<b>75%</b>','<b>100%</b>'],
    mode: 'markers+text',
    textposition : 'center left',
    marker: {
      size: [10, 20, 30, 40, 50],
      color:  '#f5527b'
    }
  }];
  
  return (
    // <Dimmer.Dimmable dimmed={isLoading} style={{height:'100%'}}>
    // <Dimmer active={isLoading} inverted>
    //   <ClimbingBoxLoader color='#6435c9' />
    // </Dimmer>
    // <Segment style={{height: '100%'}}>
    <>
    <Header textAlign='center' content={currentScatterPlotType} />
      <Plot
        data={sizeLegend}
        style={{width: '100%', height: 60}}
        layout={{
          showlegend: false,
          margin: {l:100, r:100, b:0, t:0},
          xaxis: {
            visible:false
          },
          yaxis: {
            visible:false
          },
        }}
        config={{
          displayModeBar: false,
          staticPlot:true
        }}
      />
      <Plot
        config={{showTips: false}}
        data={addColorScale(dotPlot)}
        useResizeHandler
        style={{width: '100%', height:'85%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          hoverlabel: { bgcolor: "#FFF" },
          margin: {l:40, r:30, b:50, t:20},
          legend: {"orientation": "v"},
          showlegend: false,
          xaxis: {
            title: 'Genes',
            showline: true,
            showgrid: true,
            autorange: true,
            type: 'category',
            categoryorder: 'array',
            categoryarray: getGenes(dotPlot),
          },
          yaxis: {
            title: 'Cluster Groups',
            showline: true,
            showgrid: true,
            autorange: true,
            type: 'category',
            categoryorder: 'array',
            categoryarray: getClusters(dotPlot),
          },
          hovermode: 'closest'
            }}
      />
    {/* </Dimmer.Dimmable> */}
  </>
  )
}

export default DotPlot 
