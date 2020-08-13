import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon, Grid } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDatasetsQuery} from '../../../../apollo/hooks'

import QCViolinPlot from './QCViolinPlot'
import QCScatterPlot from './QCScatterPlot'

const QCPlot = ({
}) => { 
  const {runID} = useCrescentContext()
  const {selectedQC} = useResultsPage()
  console.log(selectedQC)

  const run = useRunDatasetsQuery(runID)
  if (R.isNil(run)) {
    return null
  }

  const isSingleSample = R.compose(R.equals(1), R.length, R.prop('datasets'))(run)

  return (

    <Grid style={isSingleSample ? {height: '100%'} : {height: '100%', overflowY: 'scroll'}} divided='vertically'> 
    {
      R.compose(
        R.map(({datasetID, name}) => 
          <Grid.Row style={isSingleSample ? {height: '100%'} : {height: '50%'}} key={datasetID}>
            <Grid.Column >
              {
              R.equals(selectedQC, 'Before_After_Filtering') ? 
                <QCViolinPlot {...{runID, datasetID, name}} /> : <QCScatterPlot {...{runID, datasetID}} />
              }       
            </Grid.Column>
          </Grid.Row>
        ),
        R.prop('datasets')
      )(run)
    }
    </Grid>
  )
}

export default QCPlot 
