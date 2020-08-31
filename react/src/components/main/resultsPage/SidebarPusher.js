import React, {useEffect} from 'react'
import * as R from 'ramda'

import { Segment, Transition, Grid, Image, Message, Label,   Checkbox,
  Header,
  Icon,
  Menu,
  Sidebar,
  Button,
  Container,
  Form,
  Dimmer,
  Popup, } from 'semantic-ui-react'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import VisualizationsComponent from './visualizations'

import {useResultsPage} from '../../../redux/hooks'
import {resetResultsPage} from '../../../redux/actions/resultsPage'
import {useCrescentContext} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'

import Fade from 'react-reveal/Fade'
import Tada from 'react-reveal/Tada'
import Logo from '../../login/logo.svg'

const ResultsPageSidebarPusher = ({

}) => {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  useEffect(() => {dispatch(resetResultsPage())}, [runID])
  const {activeSidebarTab, sidebarVisible} = useResultsPage()

  // Move this into redux
  const [visible, setVisible] = React.useState(true)
  return (
    <Grid stretched>
      <Grid.Column width={visible ? 10 : 15}>
      {
        R.cond([
          [R.equals('parameters'), R.always(<ParametersComponent />)],
          [R.equals('visualizations'), R.always(<VisualizationsComponent />)]
        ])(activeSidebarTab)
      }
      </Grid.Column>
      <Grid.Column width={1}>
        <Popup
          position='left center'
          inverted
          on='hover'
          trigger={
            <Button
              color='black' basic
              icon={visible ? 'right arrow' : 'left arrow'}
              onClick={() => setVisible(!visible)}
            />
          }
          content={visible ? 'Hide menu' : 'Show menu'}
        />
      </Grid.Column>

      {
        visible && 
        <Grid.Column width={5}>
          <SidebarComponent />
        </Grid.Column>
      }
    </Grid>
  )
}

export default ResultsPageSidebarPusher