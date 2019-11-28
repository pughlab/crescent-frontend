import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Segment, Loader } from 'semantic-ui-react'

import * as R from 'ramda'

const ScatterPlot = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {activeResult, selectedGroup, availablePlots}}
    }
  },
  actions: {
    thunks: {
      initializeScatter,
      updateScatter
    }
  }
}) => {
  // also use local state for data
  const [scatterData, setScatterData] = useState( [] );
  
  useEffect(() => {
    initializeScatter(runID).then((data) => {
        setScatterData(data);
     });
  }, [activeResult])

  useEffect(() => {
    if(selectedGroup){
    setScatterData( [] ) // set to loading
    updateScatter(runID, selectedGroup).then((data) => {
      setScatterData(data);
    });
  }
  }, [selectedGroup])

  console.log(scatterData)

  return (
    <>
    {
      R.ifElse(
        R.isEmpty,
        R.always(<Loader size='big' active inline='centered' />),
        R.always(<Plot
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
            }}/>) 
      )(scatterData)
    }
    </>   
  )
})

export default ScatterPlot 
{
/*
  R.ifElse(
    R.is(),
    R.always(<Loader active inline='centered' />),
    R.always(
      <Plot
      data={scatterData}
      useResizeHandler
      style={{width: '100%', height:'100%'}}
      layout={{
        title: R.path([activeResult,'label'], availablePlots),
        autosize: true,
        hovermode: 'closest',
        xaxis: {showgrid: false, ticks: '', showticklabels: false},
        yaxis: {showgrid: false, ticks: '', showticklabels: false},
        legend: {"orientation": "h"}
        }}
      />
    )
  )(loading)
  */
}
