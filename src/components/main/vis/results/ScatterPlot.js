import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Header, Segment } from 'semantic-ui-react'
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
      fetchScatter
    }
  }
}) => {
  // use local state for data since too big for redux store
  const [scatterData, setScatterData] = useState( [] );
  
  useEffect(() => {
    fetchScatter().then((data) => {
      setScatterData(data);
    })
  }, [activeResult])

  useEffect(() => {
    if(selectedGroup){
    setScatterData( [] ) // set to loading
    fetchScatter().then((data) => {
      setScatterData(data);
    });
    }
  }, [selectedGroup])

  useEffect(() => {
      const prev = scatterData;
      setScatterData( [] ) // loading 
      fetchScatter()
        .then(data => {
          if (R.isNil(selectedFeature)) {
            setScatterData(data)
          } else {
            const merged = R.ifElse(
              R.has('error'),
              () => {console.error(data['error']); return prev}, // show error message here
              R.addIndex(R.map)((val, index) => R.mergeLeft(val, scatterData[index]))
            )(data)
            setScatterData(merged)
          }
        })
  }, [selectedFeature])

  const currentScatterPlotType = R.ifElse(
    R.isNil,
    R.always(''),
    R.path([activeResult, 'label'])
  )(availablePlots)

  return (
    <>
    {
      R.ifElse(
        R.isEmpty,
        R.always(
          <Segment basic placeholder style={{height: '100%'}}>
            <Header textAlign='center' icon>
              <ClimbingBoxLoader color='#6435c9' />
            </Header>
          </Segment>
        ),
        R.always(
          <>
          {/* Plot type: either tsne or umap scatter plots available */}
          <Header textAlign='center' content={currentScatterPlotType} />
          <Plot
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
          </>
        ) 
      )(scatterData)
    }
    </>   
  )
})

export default ScatterPlot 
