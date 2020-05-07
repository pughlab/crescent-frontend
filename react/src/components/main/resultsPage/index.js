import React from 'react'
import * as R from 'ramda'

import { Segment, Transition, Grid, Image, Message, Header, Label } from 'semantic-ui-react'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import VisualizationsComponent from './visualizations'

import {useResultsPage} from '../../../redux/hooks'

const ResultsPageComponent = ({

}) => {
  const {activeSidebarTab} = useResultsPage()
  return (
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
  )
}

export default ResultsPageComponent