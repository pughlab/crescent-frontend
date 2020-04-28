import React, { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Segment, Header, Icon } from 'semantic-ui-react'

import { ClimbingBoxLoader } from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ViolinPlot = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {selectedFeature, selectedGroup}}
    }
  },
  actions: {
    thunks: {
      fetchViolin,
      getCategoricalGroups,
      resetGroups
    }
  }
}) => {
  // use local state for data since too big for redux store
  const [violinData, setViolinData] = useState( [] )

  useEffect(() => {
    getCategoricalGroups(runID)
    return () => resetGroups(runID);
  },[])

  // Only refetch data if both group and feature are selected for violin
  useEffect(() => {
    if(R.all(RA.isNotNil, [selectedGroup, selectedFeature])){
      setViolinData( [] ) // set to loading
      fetchViolin().then(setViolinData)
    }
  }, [selectedGroup, selectedFeature])

  return (
    // Violin plot must have selected feature
    R.isNil(selectedFeature) ?
      <Segment basic placeholder style={{height: '100%'}}>
        <Header icon>
          <Icon name='right arrow' />
          Select a feature to initialize violin plot
        </Header>
      </Segment>
    // Empty violin data => loading
    : R.isEmpty(violinData) ?
      <Segment basic placeholder style={{height: '100%'}}>
        <Header textAlign='center' icon>
          <ClimbingBoxLoader color='#6435c9' />
        </Header>
      </Segment>
    :
    // Plot data
      <>
      <Header textAlign='center' content='Gene Expression Violin' />
      <Plot
        config={{showTips: false}}
        data={violinData}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {tickmode: 'linear', automargin: true, autorange: true, type: 'category'},
          yaxis: {showgrid: false, title: {text: 'Normalized Expression'}, automargin: true},
          margin: {l:45, r:20, b:20, t:20},
        }}
      />
      </>
  )
})

export default ViolinPlot 
