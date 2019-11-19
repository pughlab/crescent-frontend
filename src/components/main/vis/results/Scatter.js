import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'

const fetchScatter = () => {

}

const fetchOpacities = () => {

}

const ScatterComponent = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {activeResult, activeGroup}}
    }
  },
  actions: {
     toggle: {}
  }
}) => {
  
  return (
    <>
    {''}
    </>
  )
})

export default ScatterComponent 