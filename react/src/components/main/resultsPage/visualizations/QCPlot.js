import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import { Loader, Segment, Header, Icon, Grid } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useRunDatasetsQuery} from '../../../../apollo/hooks/run'


import QCViolinPlot from './QCViolinPlot'
import QCScatterPlot from './QCScatterPlot'

const QCPlot = ({
  plotQueryIndex
}) => { 
  const {runID} = useCrescentContext()
  const {selectedQC, selectedQCDataset, runID: compareRunID} = useResultsPagePlotQuery(plotQueryIndex)

  const run = useRunDatasetsQuery(runID || compareRunID)
  if (R.isNil(run)) {
    return null
  }
  
  const name = R.compose(R.prop('name'), R.find(R.propEq('datasetID', selectedQCDataset)))(run.datasets)
  return (
    <> 
    {
      R.equals(selectedQC, 'Before_After_Filtering') ? 
        <QCViolinPlot {...{runID: runID || compareRunID, datasetID: selectedQCDataset, name, plotQueryIndex}} />
      : <QCScatterPlot {...{runID: runID || compareRunID, datasetID: selectedQCDataset, name, plotQueryIndex}} />
    } 
    </>
  )
}

export default QCPlot 
