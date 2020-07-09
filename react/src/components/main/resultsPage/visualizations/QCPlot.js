import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'

import QCViolinPlot from './QCViolinPlot'
import QCScatterPlot from './QCScatterPlot'

const QCPlot = ({
}) => { 

  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedQC} = useResultsPage()
  console.log(selectedQC)

  return (
  <Segment basic style={{height: '100%'}}>
    {
    R.ifElse(
      R.equals('Before_After_Filtering'),
      R.always(<QCViolinPlot/>),
      R.always(<QCScatterPlot/>)
    )(selectedQC)
    }
  </Segment>
  )
}

export default QCPlot 
