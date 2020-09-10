import React, {useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import VisualizationsComponent from './visualizations'

import {useResultsPage} from '../../../redux/hooks'
import {resetResultsPage, setActiveSidebarTab} from '../../../redux/actions/resultsPage'
import {useCrescentContext} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'
import {useRunDetailsQuery} from '../../../apollo/hooks'

import Fade from 'react-reveal/Fade'

import ResultsPageSidebarPusher from './SidebarPusher'

const ResultsPageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  useEffect(() => () => dispatch(resetResultsPage()), [runID])
  const run = useRunDetailsQuery(runID)
  useEffect(() => {
    if (RA.isNotNil(run)) {
      const {status} = run
      const runIsIncomplete = R.includes(status, ['pending'])
      const sidebarTab = runIsIncomplete ? 'parameters' : 'visualizations'
      dispatch(setActiveSidebarTab({sidebarTab}))
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