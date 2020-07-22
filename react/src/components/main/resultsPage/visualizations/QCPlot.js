import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon } from 'semantic-ui-react'

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

  return (
    <Segment basic style={{height: '100%'}}>
    {
      R.equals(selectedQC, 'Before_After_Filtering') ?
        R.compose(
          R.map(datasetID => <QCViolinPlot key={datasetID} {...{runID, datasetID}} />),
          R.pluck('datasetID'),
          R.prop('datasets')
        )(run)
      :
        <QCScatterPlot/>
    }
    </Segment>
  )
}

export default QCPlot 
