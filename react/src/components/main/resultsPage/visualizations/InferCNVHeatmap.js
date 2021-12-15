import React from 'react'
import Plot from 'react-plotly.js'
import { Image, Segment } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import { useService } from '@xstate/react';
import PlotHeader from './PlotHeader';

import * as R from 'ramda'

import { useCrescentContext } from '../../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../../redux/hooks/useResultsPage'
import { useResultsAvailableQuery, useInferCNVHeatmapQuery } from '../../../../apollo/hooks/results'


const InferCNVHeatmap = ({
  plotQueryIndex
}) => {
  const { runID } = useCrescentContext()

  const { activeResult, selectedInferCNVType, runID: compareRunID, plotQueryID, service } = useResultsPagePlotQuery(plotQueryIndex)
  const [current, send] = useService(service)
  const {plots} = useResultsAvailableQuery(runID || compareRunID)
  useInferCNVHeatmapQuery(runID || compareRunID, selectedInferCNVType, plotQueryIndex)

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

  // determine the position of axis ticks
  // chromosome number on the x-axis
  const chrs = R.uniq(current.context.plotData[0].text[0])
  const chrStartIndices = R.map((chr => R.indexOf(chr, current.context.plotData[0].text[0])), chrs)
  // cell type on the y-axis 
  const transposedCellTypesList = R.transpose(current.context.plotData[0].hovertext)
  const cellTypes = R.uniq(transposedCellTypesList[0])
  const cellTypeStartIndices = R.map((dataset => R.indexOf(dataset, transposedCellTypesList[0])), cellTypes)

  return (
    <>
      <PlotHeader {...{plotQueryID}} runID={runID || compareRunID} name={currentPlotType} />
      <Segment basic style={{height: '100%'}} loading={R.test(/.*Loading/, current.value)}>
        <Plot
          config={{ showTips: false }}
          data={current.context.plotData}
          useResizeHandler
          style={{ width: '100%', height: '90%'}}
          layout={{
            autosize: true,
            hovermode: 'closest',
            hoverlabel: { bgcolor: "#FFF" },
            margin: { l: 80, r: 30, b: 80, t: 20 },
            legend: { "orientation": "v" },
            showlegend: false,
            xaxis: {
              tickvals: chrStartIndices,
              ticktext : chrs,
              tickangle: 40,
              tickfont: {
                size: 11,
              },
              title: 'Genomic Regions',
              automargin: true,
            },
            yaxis: {
              tickvals: cellTypeStartIndices,
              ticktext : cellTypes,
              tickangle: 40,
              tickfont: {
                size: 11,
              },
              title: 'Cell Types',
              automargin: true,
            },
          }}

        />
      </Segment>
    </>
  )
}

export default InferCNVHeatmap