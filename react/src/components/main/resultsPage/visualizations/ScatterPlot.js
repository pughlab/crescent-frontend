import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import { Image, Container, Header, Segment, Dimmer } from 'semantic-ui-react'
import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useResultsAvailableQuery, useScatterQuery, useScatterNumericQuery, useOpacityQuery} from '../../../../apollo/hooks/results'
import { setSelectedExpRange } from '../../../../redux/actions/resultsPage'

const violet = '#6435c9'
const lightViolet = '#c5b3eb'

const ScatterPlot = ({
  plotQueryIndex
}) => {
  const {runID} = useCrescentContext()

  const dispatch = useDispatch()
  const { sidebarCollapsed } = useResultsPage()
  const {activeResult, selectedFeature, selectedGroup, selectedDiffExpression, selectedExpRange, selectedAssay} = useResultsPagePlotQuery(plotQueryIndex)
  const isFeatureNotSelected = R.or(R.isNil, R.isEmpty)(selectedFeature)


  const plots = useResultsAvailableQuery(runID)
  const scatter = useScatterQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  const scatterNumeric = useScatterNumericQuery(activeResult, selectedGroup, runID, selectedDiffExpression)
  const opacity = useOpacityQuery(activeResult, selectedFeature, selectedGroup, runID, selectedDiffExpression, selectedExpRange, selectedAssay)
  // const numericGroups = useNumericGroupsQuery(runID, selectedDiffExpression)

  const [resetSliderValues, setResetSliderValues] = useState(null)

  useEffect(() => {
    if(R.not(R.isNil(opacity)) && resetSliderValues === selectedFeature){
      const initialRange = opacity[0]["initialminmax"].map(num => Math.round(num * 10) / 10)
      if(R.not(R.equals(selectedExpRange, initialRange))){
        dispatch(setSelectedExpRange({value: initialRange}))
        setResetSliderValues(null)
      }
    }
  }, [opacity])

  useEffect(() => {
    setResetSliderValues(selectedFeature)
  }, [selectedFeature])

  useEffect(() => {
    setResetSliderValues(null)
  }, [sidebarCollapsed])

  if (R.any(R.isNil, [plots])) {
    return null
  }

  if (R.any(R.isNil, [scatter])) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  if ((R.not(isFeatureNotSelected)) && (R.any(R.isNil, [opacity]))) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  // console.log(scatter)
  // const isSelectedDiffExpressionNumeric = R.includes(selectedGroup)(numericGroups)
  
  
  // const scatterData = isFeatureNotSelected ? 
  //   isSelectedDiffExpressionNumeric ? 
  //     scatterNumeric
  //   :
  //     scatter
  //   :
  //     opacity
  
  // const scatterData = isFeatureNotSelected ? 
  //   isSelectedDiffExpressionNumeric ? 
  //     // scatter
  //     1
  //   :
  //     // scatterNumeric
  //     2
  //   :
  //   isSelectedDiffExpressionNumeric ?
  //     // opacityCategoric
  //     3
  //   :
  //     // opacityNumeric
  //     4


  // const scatterData = R.compose(
  //   R.evolve({
  //     data: {
  //       mode: R.join('+')
  //     }
  //   })
  // )(scatter)
  // console.log(scatterData)

  // scatterData = scatter

  // const scatterData = scatter



  // use local state for data since too big for redux store
  // const [scatterData, setScatterData] = useState( [] );

  const isLoading = false
  // // func to knit opacity from server into traces
  // const addOpacity = (traces) => {
  //   return new Promise ((res, rej) => {
  //     fetchOpacity()
  //     .then(data => {
  //       const merged = R.ifElse(
  //         R.has('error'),
  //         () => {console.error(data['error']); res(traces)}, // show error on plot here
  //         R.addIndex(R.map)((val, index) => R.mergeLeft(val, traces[index]))
  //       )(data)
  //       res(merged)
  //     })
  //   })
  // }

  // // determine proper name of active plot
  const currentScatterPlotType = R.compose(
    R.prop('label'),
    R.find(R.propEq('result', activeResult)),
  )(plots)


  // // add traces and opacity
  // useEffect(() => {
  //   setIsLoading(true)
  //   fetchScatter().then((data) => {
  //     if(! R.or(R.isNil,R.isEmpty)(selectedFeature)){
  //       addOpacity(data)
  //       .then((merged) => {
  //         setScatterData(merged);
  //         setIsLoading(false);
  //       })
  //     }
  //     else{
  //       setScatterData(data);
  //       setIsLoading(false);
  //     }
  //   })
  // }, [activeResult,selectedGroup])

  // // add or clear opacity from plot
  // useEffect(() => {
  //   if(isLoading){return} // the other hook is already dealing with this 
  //   setIsLoading(true)
  //   let prev = scatterData
  //   if(! R.or(R.isNil,R.isEmpty)(selectedFeature)){
  //      addOpacity(prev)
  //     .then((merged) => {
  //       setScatterData(merged);
  //       setIsLoading(false);
  //     })
  //   }
  //   else{
  //     fetchScatter().then((data) => {
  //       setScatterData(data);
  //       setIsLoading(false); 
  //     })
  //   }
  // }, [selectedFeature])

  const SliderWithTooltip = createSliderWithTooltip(Slider.Range);
  const globalMax = R.isNil(opacity) || opacity[0]["globalmax"] 

  return (
    // <Dimmer.Dimmable dimmed={isLoading} style={{height:'100%'}}>
    // <Dimmer active={isLoading} inverted>
    //   <ClimbingBoxLoader color='#6435c9' />
    // </Dimmer>
    // <Segment style={{height: '100%'}}>
    <>
    <Header textAlign='center' content={currentScatterPlotType} />
      {
        (isFeatureNotSelected || sidebarCollapsed) || (
          <div style={{display: 'flex', justifyContent: "center", alignContent: "center"}}>
          <Header size='small'  style={{margin: 0}}>
            Gene Expression Range: 
          </Header>
          <SliderWithTooltip
            key={`slider-${plotQueryIndex}`}
            min={0} 
            max={globalMax}
            step={0.1}
            marks={{0: 0, [globalMax]: globalMax}}
            allowCross={false}
            style={{maxWidth: "300px", marginLeft: "20px", marginBottom: "20px",  color: violet}}
            trackStyle={[{ backgroundColor: violet }]}
            handleStyle={[{ backgroundColor: violet, border: "none", boxShadow: "none"}, { backgroundColor: violet, border: "none", boxShadow: "none" }]}
            railStyle={{ backgroundColor: lightViolet }}
            defaultValue={R.equals(selectedExpRange, [0, 0]) ? [0, globalMax] : selectedExpRange}
            onAfterChange={value => dispatch(setSelectedExpRange({ value }))}
          />
      </div>
      )}
      <Plot
        config={{showTips: false}}
        // data={opacity}
        data={isFeatureNotSelected ? scatter : opacity}
        // data={scatterData}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {showgrid: false, ticks: '', showticklabels: false},
          yaxis: {showgrid: false, ticks: '', showticklabels: false, scaleanchor: "x"},
          margin: {l:20, r:20, b:20, t:20},
          legend: {"orientation": "v"}
        }}
      />
    {/* </Dimmer.Dimmable> */}
  </>
  )
}

export default ScatterPlot 
