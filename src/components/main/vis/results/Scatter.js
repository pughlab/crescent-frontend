import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'

import * as R from 'ramda'

const ScatterComponent = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {activeResult, availablePlots}}
    }
  },
  actions: {
    thunks: {
      initializeScatter
    }
  }
}) => {
  // also use local state for data
  const [scatterData, setScatterData] = useState( [] );
  
  useEffect(() => {
    // on initial load
    initializeScatter(runID).then((data) => {
      setScatterData(data)
    })
  }, [])

  return (
    <>
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
    </>
  )
})

export default ScatterComponent 