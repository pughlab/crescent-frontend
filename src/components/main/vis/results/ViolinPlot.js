import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader } from 'semantic-ui-react'

import * as R from 'ramda'

const ViolinPlot = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {activeResult, selectedFeature, selectedGroup, availablePlots}}
    }
  },
  actions: {
    thunks: {
      fetchViolin
    }
  }
}) => {
  // use local state for data since too big for redux store
  const [violinData, setViolinData] = useState( [] );
  
  useEffect(() => {
    fetchViolin().then((data) => {
      setViolinData(data);
    })
  }, [activeResult])

  useEffect(() => {
    if(selectedGroup){
    setViolinData( [] ) // set to loading
    fetchViolin().then((data) => {
      setViolinData(data);
    });
    }
  }, [selectedGroup])

  useEffect(() => {
    if(selectedFeature){
      setViolinData( [] ) // set to loading
      fetchViolin().then((data) => {
        setViolinData(data);
      });
    }
  }, [selectedFeature])

  return (
    <>
    {
      R.ifElse(
        R.isEmpty,
        R.always(<Loader size='big' active inline='centered' />),
        R.always(<Plot
          data={violinData}
          useResizeHandler
          style={{width: '100%', height:'90%'}}
          layout={{
            autosize: true,
            hovermode: 'closest',
            xaxis: {showgrid: false, ticks: '', showticklabels: false},
            yaxis: {showgrid: false, ticks: '', showticklabels: false},
            margin: {l:20, r:20, b:20, t:20},
          }}/>) 
      )(violinData)
    }
    </>   
  )
})

export default ViolinPlot 
