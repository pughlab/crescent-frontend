import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Container, Header, Segment, Dimmer} from 'semantic-ui-react'
import {ClimbingBoxLoader} from 'react-spinners'
import * as R from 'ramda'

const ScatterPlot = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {activeResult, selectedFeature, selectedGroup, availablePlots}}
    }
  },
  actions: {
    thunks: {
      fetchScatter,
      fetchOpacity
    }
  }
}) => {
  // use local state for data since too big for redux store
  const [scatterData, setScatterData] = useState( [] );
  const [isLoading, setIsLoading] = useState( true );

  // func to knit opacity from server into traces
  const addOpacity = (traces) => {
    return new Promise ((res, rej) => {
      fetchOpacity()
      .then(data => {
        const merged = R.ifElse(
          R.has('error'),
          () => {console.error(data['error']); res(traces)}, // show error on plot here
          R.addIndex(R.map)((val, index) => R.mergeLeft(val, traces[index]))
        )(data)
        res(merged)
      })
    })
  }

  // determine proper name of active plot
  const currentScatterPlotType = R.ifElse(
    R.isNil,
    R.always(''),
    R.path([activeResult, 'label'])
  )(availablePlots)

  // add traces and opacity
  useEffect(() => {
    setIsLoading(true)
    fetchScatter().then((data) => {
      if(! R.or(R.isNil,R.isEmpty)(selectedFeature)){
        addOpacity(data)
        .then((merged) => {
          setScatterData(merged);
          setIsLoading(false);
        })
      }
      else{
        setScatterData(data);
        setIsLoading(false);
      }
    })
  }, [activeResult,selectedGroup])

  // add or clear opacity from plot
  useEffect(() => {
    if(isLoading){return} // the other hook is already dealing with this 
    setIsLoading(true)
    let prev = scatterData
    if(! R.or(R.isNil,R.isEmpty)(selectedFeature)){
       addOpacity(prev)
      .then((merged) => {
        setScatterData(merged);
        setIsLoading(false);
      })
    }
    else{
      fetchScatter().then((data) => {
        setScatterData(data);
        setIsLoading(false); 
      })
    }
  }, [selectedFeature])


  return (
    <>
    <Dimmer.Dimmable dimmed={isLoading} style={{height:'100%'}}>
    <Dimmer active={isLoading} inverted>
      <ClimbingBoxLoader color='#6435c9' />
    </Dimmer>
    <Header textAlign='center' content={currentScatterPlotType} />
      <Plot
        config={{showTips: false}}
        data={scatterData}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {showgrid: false, ticks: '', showticklabels: false},
          yaxis: {showgrid: false, ticks: '', showticklabels: false},
          margin: {l:20, r:20, b:20, t:20},
          legend: {"orientation": "h"}
        }}
      />
    </Dimmer.Dimmable>
    </>
  )
})

export default ScatterPlot 
