import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ViolinPlot = withRedux(
  ({
  app: {
    toggle: {
      vis: {results: {selectedFeature, selectedGroup}}
    }
  },
  actions: {
    thunks: {
      fetchViolin
    }
  }
}) => {
  // use local state for data since too big for redux store
  const [violinData, setViolinData] = useState( [] )

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
      <Header textAlign='center' content='Violin' />
      <Plot
        data={violinData}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {showgrid: false, ticks: '', showticklabels: false},
          yaxis: {showgrid: false, ticks: '', showticklabels: false},
          margin: {l:20, r:20, b:20, t:20},
        }}
      />
      </>
  )
})

export default ViolinPlot 
