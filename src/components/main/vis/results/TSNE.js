import React, {useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'


const fetchAvailableGroups = (app, actions) => {
  const {
    run: {runID}
  } = app;
  const {
    setAvailableGroups
  } = actions;
  fetch(`/metadata/groups/${runID}`)
  .then(resp => resp.json())
  .then(data => {setAvailableGroups(data)})
}

/*
TSNE, UMAP, and BISNE can be combined into a Scatter component
all use same logic, endpoints, etc.
*/
const fetchScatter = () => {

}

const fetchOpacities = () => {

}


const TSNEComponent = withRedux(({
  app,
  actions
  }) => {
  const {
    run: {runID}
  } = app;
  const {
    setAvailableGroups
  } = actions;
  //console.log('redux state', app)
  //console.log('redux actions', actions)
  useEffect(() => {
    fetch(`/metadata/groups/${runID}`)
    .then(resp => resp.json())
    .then(({groups}) => {setAvailableGroups(groups)})
  }, [runID])
  
  return (
    <>
    {'TSNE'}
    </>
  )
})

export default TSNEComponent