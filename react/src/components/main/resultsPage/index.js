import React, {useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import {resetResultsPage, setActiveSidebarTab, initializePlots} from '../../../redux/actions/resultsPage'
import {useCrescentContext, useComparePage} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'
import {useRunDetailsQuery} from '../../../apollo/hooks/run'

import Fade from 'react-reveal/Fade'

import ResultsPageSidebarPusher from './SidebarPusher'

const ResultsPageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  const {selectedPlotID} = useComparePage()
  useEffect(() => () => dispatch(resetResultsPage()), [runID])
  const run = useRunDetailsQuery(runID)
  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {status} = run
      const runIsIncomplete = R.includes(status, ['pending'])
      const sidebarTab = runIsIncomplete ? 'parameters' : 'visualizations' //'parameters' replaced by 'data', is disabled unless run.referenceDatasets is nonempty
      dispatch(setActiveSidebarTab({sidebarTab}))
      dispatch(initializePlots({value: run.savedPlotQueries, selectedPlotID}))
    }
  }, [run])
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