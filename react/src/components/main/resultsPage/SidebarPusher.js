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
  Dimmer, } from 'semantic-ui-react'

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
  const {activeSidebarTab} = useResultsPage()

  const leftRef = React.useRef()
  const rightRef = React.useRef()
  const [visible, setVisible] = React.useState(false)
  return (
    <Sidebar.Pushable>
      <Sidebar
        as={Segment}
        animation='scale down'
        direction='right'
        target={rightRef}
        visible={visible}
        width='very wide'
      >
              <Button fluid
                content='open'
                onClick={() => setVisible(!visible)}
              />
        <SidebarComponent />
      </Sidebar>

      <Sidebar.Pusher as={Grid} stretched>

            <Grid.Column width={15}>
            {
              R.cond([
                [R.equals('parameters'), R.always(<ParametersComponent />)],
                [R.equals('visualizations'), R.always(<VisualizationsComponent />)]
              ])(activeSidebarTab)
            }
            </Grid.Column>
            <Grid.Column width={1}>

              <Button
                content='open'
                onClick={() => setVisible(!visible)}
              />
            </Grid.Column>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  )
}

export default ResultsPageSidebarPusher