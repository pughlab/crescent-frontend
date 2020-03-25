import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const QCPlot = withRedux(
  ({
  app: {
    run: {runID},
    toggle: {vis: {results: {selectedQC}}}
  },
  actions: {
    thunks: {
      fetchQC
    }
  }
}) => {
  // use local state for data
  const [qcData, setQCData] = useState( [] )

  // use the selected plot type to determine this
  useEffect(() => {
    setQCData( [] ) // set to loading
    fetchQC(selectedQC).then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        setQCData
      )(data)
    })
    //TODO: return clear qc redux state change
    return setQCData([])
  
  }, [selectedQC])

  return (
    // Empty qc data => loading
    R.isEmpty(qcData) ?
      <Segment basic placeholder style={{height: '100%'}}>
        <Header textAlign='center' icon>
          <ClimbingBoxLoader color='#6435c9' />
        </Header>
      </Segment>
    :
      // Plot data
      R.equals('Before_After_Filtering', selectedQC) ?
        <>
        <Header textAlign='center' content={R.isNil(selectedQC) ? '' : selectedQC.replace(/_/g," ")} />
        <Plot
          config={{showTips: false}}
          data={qcData}
          useResizeHandler
          style={{width: '100%', height:'90%'}}
          layout={{
            autosize: true,
            grid: {rows: 1, columns: 4, pattern: 'independent'},
            margin: {l:40, r:40, b:20, t:30},
            showlegend: false,
            hovermode: 'closest',
            yaxis: {
              range: [0, R.isNil(qcData[0]) ? 1.1 : Math.max(...R.map(parseInt, qcData[0]['y']))+1]
            },
            yaxis2: {
              range: [0, R.isNil(qcData[2]) ? 1.1: Math.round(Math.max(...R.map(parseInt, qcData[2]['y'])))+1]
            },
            yaxis3: {
              range: [0, R.isNil(qcData[4]) ? 101: Math.round(Math.max(...R.map(parseInt, qcData[4]['y'])))+1]
            },
            yaxis4: {
              range: [0, R.isNil(qcData[6]) ? 101: Math.round(Math.max(...R.map(parseInt, qcData[6]['y'])))+1]
            },
            annotations: [
              {
                "x": 0.11,
                "y": 1,
                "text": "Number of Genes",
                "xref": "paper",
                "yref": "paper",
                "xanchor": "center",
                "yanchor": "bottom",
                "showarrow": false
              },
              {
                "x": 0.37,
                "y": 1,
                "text": "Number of Reads",
                "xref": "paper",
                "yref": "paper",
                "xanchor": "center",
                "yanchor": "bottom",
                "showarrow": false
              },
              {
                "x": 0.63,
                "y": 1,
                "text": "Percentage of Mitochondrial Genes",
                "xref": "paper",
                "yref": "paper",
                "xanchor": "center",
                "yanchor": "bottom",
                "showarrow": false
              },
              {
                "x": 0.89,
                "y": 1,
                "text": "Percentage of Ribosomal Protein Genes",
                "xref": "paper",
                "yref": "paper",
                "xanchor": "center",
                "yanchor": "bottom",
                "showarrow": false
              }
              ]
          }}
        />
        </>
      :
      <>
        <Header textAlign='center' content={R.isNil(selectedQC) ? '' : selectedQC.replace(/_/g," ")} />
        <Plot
          config={{showTips: false}}
          data={qcData}
          useResizeHandler
          style={{width: '100%', height:'100%'}}
          layout={{
            autosize: true,
            hovermode: 'closest',
            xaxis: {showgrid: false, ticks: '', showticklabels: false},
            yaxis: {showgrid: false, ticks: '', showticklabels: false, scaleanchor: "x"},
            margin: {l:20, r:20, b:20, t:20},
            legend: {"orientation": "v"}
          }}
        />
      </>
  )
})

export default QCPlot 
