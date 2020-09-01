import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon, Grid } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useRunDatasetsQuery} from '../../../../apollo/hooks'


import QCViolinPlot from './QCViolinPlot'
import QCScatterPlot from './QCScatterPlot'

const QCPlot = ({
  plotQueryIndex
}) => { 
  const {runID} = useCrescentContext()
  const {selectedQC} = useResultsPagePlotQuery(plotQueryIndex)

  const run = useRunDatasetsQuery(runID)
  if (R.isNil(run)) {
    return null
  }

  const isSingleSample = R.compose(R.equals(1), R.length, R.prop('datasets'))(run)

  return (
    <> 
    {
      R.compose(
        R.map(({datasetID, name}) => 
          <Segment style={isSingleSample ? {height: '70vh'} : {height: '35vh'}} key={datasetID}>
          {
            R.equals(selectedQC, 'Before_After_Filtering') ? 
              <QCViolinPlot {...{runID, datasetID, name, plotQueryIndex}} /> : <QCScatterPlot {...{runID, datasetID, plotQueryIndex}} />
          }       
          </Segment>
        ),
        R.prop('datasets')
      )(run)
    }
    </>
  )
}

export default QCPlot 
