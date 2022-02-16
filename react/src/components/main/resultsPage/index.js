import React, {useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {Grid, Segment} from 'semantic-ui-react'

import {initializePlots, resetResultsPage, setActiveSidebarTab, setRunStatus} from '../../../redux/slices/resultsPage'
import {useCrescentContext, useComparePage} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'
import {useRunDetailsQuery} from '../../../apollo/hooks/run'

import Fade from 'react-reveal/Fade'

import ResultsPageSidebarPusher from './SidebarPusher'

const ResultsPageComponent = () => {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  const {selectedPlotID} = useComparePage()
  const {getRunStatus, run, runStatus, startStatusPolling, stopStatusPolling} = useRunDetailsQuery(runID)

  useEffect(() => {
    getRunStatus()

    return () => dispatch(resetResultsPage())
  }, [dispatch, getRunStatus, runID])

  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {savedPlotQueries} = run
      dispatch(initializePlots({value: savedPlotQueries, selectedPlotID}))
    }
  }, [dispatch, run, selectedPlotID])

  useEffect(() => {
    if (RA.isNotNil(runStatus)) {
      const runIsIncomplete = R.equals('pending', runStatus)
      const sidebarTab = runIsIncomplete ? 'parameters' : 'visualizations'

      dispatch(setRunStatus({status: runStatus}))
      dispatch(setActiveSidebarTab({sidebarTab}))

      if (R.any(R.equals(runStatus), ['pending', 'submitted'])) {
        startStatusPolling(1000)
      } else {
        stopStatusPolling()
      }
    }
  }, [dispatch, runStatus, startStatusPolling, stopStatusPolling])

  if (R.isNil(run)) {
    return null
  }
  
  return (
    <Fade duration={2000}>
      <Segment basic style={{minHeight: 'calc(100vh - 10rem)'}} as={Grid} stretched columns={1}>
        <Grid.Column>
          <ResultsPageSidebarPusher />
        </Grid.Column>
      </Segment>
    </Fade>
  )
}

export default ResultsPageComponent