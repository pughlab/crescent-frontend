import {useState, useEffect, useCallback } from 'react'
import ResponsivePlot, {ResponsivePlotSegment} from './ResponsivePlot'

import { Image, Segment, Header, Icon } from 'semantic-ui-react'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import PlotHeader from './PlotHeader'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useQCViolinQuery} from '../../../../apollo/hooks/results'
import { useService } from '@xstate/react';

const QCViolinPlot = ({
  runID,
  datasetID,
  name,
  plotQueryIndex
}) => { 
  const {selectedQC, plotQueryID, service} = useResultsPagePlotQuery(plotQueryIndex)  
  useQCViolinQuery({runID, datasetID}, plotQueryIndex)
  const [current, send] = useService(service)

  if (R.test(/initial.*Loading/, current.value)) {
    return (
    <Segment basic style={{height: '100%'}} placeholder>
      <Tada forever duration={1000}>
        <Image src={Logo} centered size='medium' />
      </Tada>
    </Segment>
    )
  }
  const { plotData } = current.context
  
  return (
    <>
    <PlotHeader {...{plotQueryID, runID}} name={R.isNil(selectedQC) ? '' : `Metrics Before and After QC for ${name} (Violins)`}/>
    <ResponsivePlotSegment loading={current.matches('violinLoading')}>
      <ResponsivePlot
        config={{showTips: false}}
        data={plotData}
        layout={{
          grid: {rows: 1, columns: 4, pattern: 'independent'},
          margin: {l:40, r:40, b:20, t:30},
          showlegend: false,
          hovermode: 'closest',
          yaxis: {
            range: [0, R.isNil(plotData[0]) ? 1.1 : Math.max(...R.map(parseInt, plotData[0]['y']))+1]
          },
          yaxis2: {
            range: [0, R.isNil(plotData[2]) ? 1.1: Math.round(Math.max(...R.map(parseInt, plotData[2]['y'])))+1]
          },
          yaxis3: {
            range: [0, R.isNil(plotData[4]) ? 101: Math.round(Math.max(...R.map(parseInt, plotData[4]['y'])))+1]
          },
          yaxis4: {
            range: [0, R.isNil(plotData[6]) ? 101: Math.round(Math.max(...R.map(parseInt, plotData[6]['y'])))+1]
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
              "text": "Number of UMI Counts",
              "xref": "paper",
              "yref": "paper",
              "xanchor": "center",
              "yanchor": "bottom",
              "showarrow": false
            },
            {
              "x": 0.63,
              "y": 1,
              "text": "Mitochondrial Gene Counts (%) ",
              "xref": "paper",
              "yref": "paper",
              "xanchor": "center",
              "yanchor": "bottom",
              "showarrow": false
            },
            {
              "x": 0.89,
              "y": 1,
              "text": "  Ribosomal Protein Gene Counts (%)",
              "xref": "paper",
              "yref": "paper",
              "xanchor": "center",
              "yanchor": "bottom",
              "showarrow": false
            }
            ]
        }}
      />
    </ResponsivePlotSegment>
    </>
  )
}

export default QCViolinPlot 
