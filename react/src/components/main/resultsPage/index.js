import React, {useEffect} from 'react'
import * as R from 'ramda'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import VisualizationsComponent from './visualizations'

import {useResultsPage} from '../../../redux/hooks'
import {resetResultsPage} from '../../../redux/actions/resultsPage'
import {useCrescentContext} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'

import Fade from 'react-reveal/Fade'

const ResultsPageComponent = ({

}) => {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  useEffect(() => {dispatch(resetResultsPage())}, [runID])
  const {activeSidebarTab} = useResultsPage()
  return (
    <Fade duration={2000}>
    <Segment basic style={{minHeight: 'calc(100vh - 10rem)'}} as={Grid}>
      <Grid.Column width={11}>
        {
          R.cond([
            [R.equals('parameters'), R.always(<ParametersComponent />)],
            [R.equals('visualizations'), R.always(<VisualizationsComponent />)]
          ])(activeSidebarTab)
        }
      </Grid.Column>
      <Grid.Column width={5}>
          <SidebarComponent />
      </Grid.Column>
    </Segment>
    </Fade>
  )
}

export default ResultsPageComponent