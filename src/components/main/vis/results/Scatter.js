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

  useEffect(() => {
    //initializeScatter(runID, activeResult)
  }, [activeResult])
 
  const viewData = () => {
    if(! R.isNil(activeResult)){
      return R.path([activeResult,'data'], availablePlots);
    }
    return []
  }

  return (
    <>
    <Plot
      data={viewData()}
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