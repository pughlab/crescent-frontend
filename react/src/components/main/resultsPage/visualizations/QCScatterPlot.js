import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useQCScatterQuery} from '../../../../apollo/hooks'

import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
 
const QCScatterPlot = ({
  plotQueryIndex
}) => { 

  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedQC} = useResultsPagePlotQuery(plotQueryIndex)

  const qcScatter = useQCScatterQuery(selectedQC, runID)

  if (R.any(R.isNil, [qcScatter])) {
    return (
      <Segment style={{height: '100%'}} basic placeholder>
      <Tada forever duration={1000}>
        <Image src={Logo} centered size='medium' />
      </Tada>
    </Segment>
    )
  }

  const qcScatterData = []
  qcScatterData.push(qcScatter)
  
  return (
    <>
      <Header textAlign='center' content={R.isNil(selectedQC) ? '' : (selectedQC.replace(/_/g," ")+" (UMAP)")} />
      <Plot
        config={{showTips: false}}
        data={qcScatterData}
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
    </>
  )
}

export default QCScatterPlot 
