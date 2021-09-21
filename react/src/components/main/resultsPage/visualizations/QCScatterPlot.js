import React, {useState, useEffect, useCallback } from 'react'
import ResponsivePlot, {ResponsivePlotSegment} from './ResponsivePlot'
import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import { useService } from '@xstate/react';
import PlotHeader from './PlotHeader'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useQCScatterQuery} from '../../../../apollo/hooks/results'

import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
 
const QCScatterPlot = ({
  runID,
  datasetID,
  name,
  plotQueryIndex
}) => { 

  const dispatch = useDispatch()
  const {selectedQC, plotQueryID, service} = useResultsPagePlotQuery(plotQueryIndex)
  useQCScatterQuery(selectedQC, runID, datasetID, plotQueryIndex)
  const [current, send] = useService(service)

  if (R.test(/initial.*Loading/, current.value)) {
    return (
      <Segment style={{height: '100%'}} basic placeholder>
      <Tada forever duration={1000}>
        <Image src={Logo} centered size='medium' />
      </Tada>
    </Segment>
    )
  }

  return (
    <>
      <PlotHeader {...{plotQueryID, runID}} name={R.isNil(selectedQC) ? '' : R.equals(selectedQC)('Number_of_Reads') ? "Number of UMI Counts for "+name+" (UMAP)" : (selectedQC.replace(/_/g," ")+" for "+name+" (UMAP)")}/>
      <ResponsivePlotSegment loading={current.matches('umapLoading')}>
        <ResponsivePlot
          config={{showTips: false}}
          data={current.context.plotData}
          layout={{
            hovermode: 'closest',
            xaxis: {showgrid: false, ticks: '', showticklabels: false},
            yaxis: {showgrid: false, ticks: '', showticklabels: false, scaleanchor: "x"},
            margin: {l:20, r:20, b:20, t:20},
            legend: {"orientation": "v"}
          }}
        />
      </ResponsivePlotSegment>
    </>
  )
}

export default QCScatterPlot 
