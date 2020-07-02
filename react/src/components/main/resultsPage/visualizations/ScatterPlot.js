import React, {useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import withRedux from '../../../../redux/hoc'
import { Loader, Segment, Header, Icon } from 'semantic-ui-react'

import {ClimbingBoxLoader} from 'react-spinners'
import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useScatterQuery} from '../../../../apollo/hooks'
import {setSelectedQC} from '../../../../redux/actions/resultsPage'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const ScatterPlot = ({
}) => { 

  const {runID} = useCrescentContext()
  const dispatch = useDispatch()
  const {selectedQC} = useResultsPage()
  

 // use local state for data since too big for redux store
//  const [scatterData, setScatterData] = useState( [] );
//  const [isLoading, setIsLoading] = useState( true );

//need to make a scatterData = useScatterData
//loading stuff unclear atm

const scatterData = useScatterQuery(runID)
//const qcMetrics = useQCMetricsQuery(runID)

  return (
    <Loader></Loader>
  )
}

export default ScatterPlot 
