import React, { useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import { Image, Container, Header, Segment, Label } from 'semantic-ui-react'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import { ClimbingBoxLoader } from 'react-spinners'
import Shake from 'react-reveal/Shake'

import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../../redux/hooks/useResultsPage'
import { useResultsAvailableQuery, useHeatmapQuery } from '../../../../apollo/hooks/results'


const Heatmap = ({
  plotQueryIndex
}) => {
  const { runID } = useCrescentContext()
  const { activeResult } = useResultsPagePlotQuery(plotQueryIndex)
  const plots = useResultsAvailableQuery(runID)
  const {heatmap, loading} = useHeatmapQuery(runID)
  const [selectedCell, setSelectedCell] = useState(null)

  if (R.any(R.isNil, [plots])) {
    return null
  }
  
  if (R.any(R.isNil, [heatmap])) {
    return (
      <Segment basic style={{height: '100%'}} placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
      </Segment>
    )
  }

  // determine proper name of active plot
  const currentPlotType = R.compose(
    R.prop('label'),
    R.find(R.propEq('result', activeResult)),
  )(plots)

  return (
    <>
      <Header textAlign='center' content={currentPlotType} />
      <Segment basic loading={loading} style={{height: '100%'}}>
        <Plot
          config={{ showTips: false }}
          data={heatmap}
          useResizeHandler
          style={{ width: '100%',height: '90%'}}
          onClick={e => setSelectedCell({x: e.points[0].x, y: e.points[0].y, z: e.points[0].z})}
          layout={{
            autosize: true,
            hovermode: 'closest',
            hoverlabel: { bgcolor: "#FFF" },
            margin: { l: 50, r: 30, b: 20, t: 20 },
            legend: { "orientation": "v" },
            showlegend: false,
            xaxis: {
              title: 'Cell Types',
              automargin: true,
            },
            yaxis: {
              title: 'Clusters',
              automargin: true,
            },
          }}

        />
       {R.not(R.isNil(selectedCell)) &&
          <Segment basic textAlign={"center"} style={{padding: 0, margin: 0}}>
            <Label>
              Selected Cell Cluster: 
              <Label.Detail>{selectedCell.y}</Label.Detail>
            </Label>
            <Label>
              Selected Cluster Label:
              <Label.Detail>{selectedCell.x}</Label.Detail>
            </Label>
            <Label>
              Selected Enrichment Score:
              <Label.Detail>{selectedCell.z}</Label.Detail>
            </Label>
          </Segment>
        }
      </Segment>
    </>
  )
}

export default Heatmap
