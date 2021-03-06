import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import { useService } from '@xstate/react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useQCScatterQuery} from '../../../../apollo/hooks/results'

import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
 
const QCScatterPlot = ({
  datasetID,
  name,
  plotQueryIndex
}) => { 

  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedQC, service} = useResultsPagePlotQuery(plotQueryIndex)
  
  useQCScatterQuery(selectedQC, runID, datasetID, plotQueryIndex)
  
  const [current, send] = useService(service)

  if (current.matches('initialLoading')) {
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
      <Header textAlign='center' content={R.isNil(selectedQC) ? '' : R.equals(selectedQC)('Number_of_Reads') ? "Number of UMI Counts for "+name+" (UMAP)" : (selectedQC.replace(/_/g," ")+" for "+name+" (UMAP)")} />
      <Segment basic loading={current.matches('umapLoading')} style={{height: '100%'}}>
        <Plot
          config={{showTips: false}}
          data={current.context.plotData}
          useResizeHandler
          style={{width: '100%', height:'95%'}}
          layout={{
            autosize: true,
            hovermode: 'closest',
            xaxis: {showgrid: false, ticks: '', showticklabels: false},
            yaxis: {showgrid: false, ticks: '', showticklabels: false, scaleanchor: "x"},
            margin: {l:20, r:20, b:20, t:20},
            legend: {"orientation": "v"}
          }}
        />
      </Segment>
    </>
  )
}

export default QCScatterPlot 
