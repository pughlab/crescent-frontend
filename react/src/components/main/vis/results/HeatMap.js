import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Label } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const HeatMap = withRedux(
  ({
  app: {
    run: { runID },
    toggle: {
      vis: {results: {selectedFeature, selectedGroup}}
    }
  },
  actions: {
    thunks: {
      fetchHeatMap
    }
  }
}) => {

  const [heatmapData, setHeatMapData] = useState( [] )
  const [selectedCluster, setSelectedCluster] = useState( '' )
  const [selectedCellType, setSelectedCellType] = useState( '' )
  const [selectedValue, setSelectedValue] = useState( '' )

  useEffect(() => {
    fetchHeatMap().then((data) => {
      R.ifElse(
        R.has('error'),
        R.always(console.log(data['error'])),
        setHeatMapData
      )([data])
    })
  }, [runID])

  const displaySelected = (event) => {
    setSelectedCellType(event['points'][0]['x'])
    setSelectedCluster(event['points'][0]['y'])
    setSelectedValue(event['points'][0]['z'])
  }

  return (
    <>
      <Header textAlign='center' content='GSVA HeatMap' />
      <Plot
        config={{showTips: false}}
        data={heatmapData}
        useResizeHandler
        style={{width: '100%', height:'90%'}}
        layout={{
          autosize: true,
          hovermode: 'closest',
          xaxis: {tickmode: 'linear', automargin: true, autorange: true, type: 'category', title: {text: 'Cell Types'}},
          yaxis: {showgrid: false, title: {text: 'Clusters'}, automargin: true},
          margin: {l:45, r:20, b:20, t:25},
        }}
        onClick={(e) => displaySelected(e)}
        />
        {RA.isNotEmpty(selectedCluster) &&
          <Segment basic textAlign={"center"}>
          <Label>
            Selected Cell Cluster: 
            <Label.Detail>{selectedCluster}</Label.Detail>
          </Label>
          <Label>
            Selected Cell Type:
            <Label.Detail>{selectedCellType}</Label.Detail>
          </Label>
          <Label>
            Selected Probability Value:
            <Label.Detail>{selectedValue}</Label.Detail>
          </Label>

          </Segment>
        }
    </>
  )
})

export default HeatMap 
