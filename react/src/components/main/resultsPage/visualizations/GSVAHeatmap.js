import React, { useState, useEffect, useCallback } from 'react'
import ResponsivePlot, {ResponsivePlotSegment} from './ResponsivePlot'
import { Image, Container, Header, Segment, Label } from 'semantic-ui-react'
import Slider, { createSliderWithTooltip } from 'rc-slider';

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import { useService } from '@xstate/react';
import PlotHeader from './PlotHeader';

import * as R from 'ramda'

import { useCrescentContext } from '../../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../../redux/hooks/useResultsPage'
import { useResultsAvailableQuery, useGSVAHeatmapQuery } from '../../../../apollo/hooks/results'


const GSVAHeatmap = ({
  plotQueryIndex
}) => {
  const { runID } = useCrescentContext()
  
  const { activeResult, runID: compareRunID, plotQueryID, service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)
  const {plots} = useResultsAvailableQuery(runID || compareRunID)
  useGSVAHeatmapQuery(runID || compareRunID, plotQueryIndex)
  const [selectedCell, setSelectedCell] = useState(null)
  
  if (R.any(R.isNil, [plots])) {
    return null
  }
  
  if (current.matches('initialLoading')) {
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
      <PlotHeader {...{plotQueryID}} name={currentPlotType} runID={runID || compareRunID} />
      <ResponsivePlotSegment
        // loading={loading}
      >
        <ResponsivePlot
          automargin
          config={{ showTips: false }}
          data={current.context.plotData}
          onClick={e => setSelectedCell({x: e.points[0].x, y: e.points[0].y, z: e.points[0].z})}
          layout={{
            hovermode: 'closest',
            hoverlabel: { bgcolor: "#FFF" },
            margin: { l: 50, r: 30, b: 20, t: 20 },
            legend: { "orientation": "v" },
            showlegend: false,
            xaxis: {
              tickangle: 40,
              tickfont: {
                size: 11,
              },
              title: 'Cell Types',
            },
            yaxis: {
              tickfont: {
                size: 11,
              },
              title: 'Clusters',
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
      </ResponsivePlotSegment>
    </>
  )
}

export default GSVAHeatmap
