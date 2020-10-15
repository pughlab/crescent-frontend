import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Image, Container, Header, Segment, Dimmer} from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useResultsAvailableQuery, useDotPlotQuery} from '../../../../apollo/hooks'

const DotPlot = ({
  plotQueryIndex
}) => {
  const {runID} = useCrescentContext()

  const dispatch = useDispatch()
  const {activeResult, selectedFeature, selectedGroup, selectedDiffExpression} = useResultsPagePlotQuery(plotQueryIndex)
  const isFeatureNotSelected = R.or(R.isNil, R.isEmpty)(selectedFeature)


  const plots = useResultsAvailableQuery(runID)
  const dotPlots = useDotPlotQuery(runID)
  // const scatter = useScatterQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  // const scatterNumeric = useScatterNumericQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  // const opacity = useOpacityQuery(activeResult, selectedFeature, selectedGroup, runID, selectedDiffExpression)
  // const numericGroups = useNumericGroupsQuery(runID, selectedDiffExpression)

  if (R.any(R.isNil, [plots])) {
    return null
  }

  if (R.any(R.isNil, [dotPlots])) {
    console.log(dotPlots)
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }
  

  // if ((R.not(isFeatureNotSelected)) && (R.any(R.isNil, [opacity]))) {
  //   return (
  //     <Segment basic style={{height: '100%'}} placeholder>
  //       <Tada forever duration={1000}>
  //         <Image src={Logo} centered size='medium' />
  //       </Tada>
  //     </Segment>
  //   )
  // }

const gene = [
  'PF4',
  'FCGR3A',
  'PTPTRCAP',
  'IL32',
  'CCL5'
]
const cluster = [
  'cluster0',
  'cluster1',
  'cluster2',
  'cluster3',
  
]
// var data = [{
//   type: 'scatter',
//   x: ['PF4', 'PF4', 'PF4', 'PF4', 'PF4',],
//   y: cluster,
//   mode: 'markers',
//   marker: {
//     color:  'rgb(61, 29, 253)',
//     symbol: 'circle',
//     size: [14, 30, 10, 20, 10],
//     opacity: [1, 0.8, 0.6, 0.4, 0.2],
//     colorscale:[[0, 'rgb(227, 224, 254)'],[1, 'rgb(61, 29, 253)']],
//     showscale: true,
//   },
//   hovertemplate: '<b>Percent Expressed</b>: %{marker.size:}%' +
//   '<br><b>Cluster</b>: %{y}' +
//   '<br><b>Gene</b>: %{x}<br>',
// },
// {
//   type: 'scatter',
//   x: ['FCGR3A','FCGR3A','FCGR3A','FCGR3A','FCGR3A'],
//   y: cluster,
//   mode: 'markers',
//   marker: {
//     color: 'rgb(61, 29, 253)',
//     symbol: 'circle',
//     size: [10, 20, 30, 40, 13],
//     opacity: [ 0.8, 0.6, 0.4, 1, 0.2],
//   }
// },
// {
//   type: 'scatter',
//   x: ['PTPTRCAP','PTPTRCAP','PTPTRCAP','PTPTRCAP','PTPTRCAP',],
//   y: cluster,
//   mode: 'markers',
//   marker: {
//     color: 'rgb(61, 29, 253)',
//     symbol: 'circle',
//     size: [10, 25, 20, 23, 20],
//     opacity: [1, 0.8, 0.6, 0.4, 0.2],
//   }
// },
// {
//   type: 'scatter',
//   x: ['IL32','IL32','IL32','IL32','IL32',],
//   y: cluster,
//   mode: 'markers',
//   marker: {
//     color: 'rgb(61, 29, 253)',
//     symbol: 'circle',
//     size: [30, 20, 15, 20, 12],
//     opacity: [5, 0.8, 0.6, 0.4, 0.2],
//   }
// },
// {
//   type: 'scatter',
//   x: ['CCL5', 'CCL5', 'CCL5', 'CCL5', 'CCL5', ],
//   y: cluster,
//   mode: 'markers',
//   marker: {
//     color: 'rgb(61, 29, 253)',
//     symbol: 'circle',
//     size: [25, 20, 23, 10, 30],
//     opacity: [1, 0.8, 0.6, 0.4, 0.2],
//   }
// }];

  const isLoading = false

  // // determine proper name of active plot
  const currentScatterPlotType = R.compose(
    R.prop('label'),
    R.find(R.propEq('result', activeResult)),
  )(plots)




  return (
    // <Dimmer.Dimmable dimmed={isLoading} style={{height:'100%'}}>
    // <Dimmer active={isLoading} inverted>
    //   <ClimbingBoxLoader color='#6435c9' />
    // </Dimmer>
    // <Segment style={{height: '100%'}}>
    <>
    <Header textAlign='center' content={currentScatterPlotType} />
      <Plot
        config={{showTips: false}}
        // data={opacity}
        // data={isFeatureNotSelected ? scatter : opacity}
        // data={[trace1, trace2 ,trace3, trace4, trace5]}
        data={dotPlots}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          margin: {l:20, r:20, b:20, t:20},
          legend: {"orientation": "v"},
          showlegend: false,
          annotations: {
            text: 'sfjhsdjkfh'
          },
          xaxis: {
            title: 'Genes',
            showline: true,
            showgrid: false,
            autorange: false,
            type: 'category',
            categoryorder: 'array',
            categoryarray: gene,
          },
          yaxis: {
            title: 'Cluster Groups',
            showline: true,
            showgrid: false,
            autorange: false,
            type: 'category',
            categoryorder: 'array',
            categoryarray: cluster,
          },
          margin: {
            l: 140,
            r: 40,
            b: 50,
            t: 80
          },
          hovermode: 'closest'
            }}
      />
    {/* </Dimmer.Dimmable> */}
  </>
  )
}

export default DotPlot 
