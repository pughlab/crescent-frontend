import React, {useEffect, useRef, useState} from 'react'
import * as R from 'ramda'

import {Button, Divider, Grid, Icon, Popup, Ref, Sticky} from 'semantic-ui-react'

import SidebarComponent from './sidebar'
import ParametersComponent from './parameters'
import VisualizationsComponent from './visualizations'
import LogsComponent from './logs'
import AnnotationsComponent from './annotations'

import {useResultsPage} from '../../../redux/hooks'
import {toggleSidebarCollapsed} from '../../../redux/actions/resultsPage'
import {useCrescentContext} from '../../../redux/hooks'
import {useDispatch} from 'react-redux'

import Fade from 'react-reveal/Fade'

const ResultsPageSidebarPusher = () => {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  const {activeSidebarTab, sidebarCollapsed} = useResultsPage()

  const stickyRef = useRef()

  const [showScroll, setShowScroll] = useState(false)
  const handleScroll = () => {
    if (!showScroll && window.pageYOffset > 200){
      setShowScroll(true)
    } else if (showScroll && window.pageYOffset <= 200){
      setShowScroll(false)
    }
  }
  // Resets plot zooming on scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const activeSidebarTabIs = R.equals(activeSidebarTab)
  return (
    <Ref innerRef={stickyRef}>
    <Grid>
      <Grid.Column width={sidebarCollapsed ? 15 : 10} stretched>
      {
        activeSidebarTabIs('parameters') ? <ParametersComponent />
        : activeSidebarTabIs('visualizations') ? <VisualizationsComponent />
        : activeSidebarTabIs('logs') ? <LogsComponent /> 
        // : activeSidebarTabIs('data') ? <DataComponent />
        : activeSidebarTabIs('annotations') ? <AnnotationsComponent />
        : null
      }
      </Grid.Column>

      {
        R.not(sidebarCollapsed) && 
        <Grid.Column width={5} stretched>
          <Fade right>
          <SidebarComponent />
          </Fade>
        </Grid.Column>
      }

      <Grid.Column width={1} stretched>
      <Sticky context={stickyRef}>
        <Popup
          position='top right'
          inverted
          on='hover'
          trigger={
            <Button fluid
              animated='fade'
              color='black' basic
              onClick={() => dispatch(toggleSidebarCollapsed())}
            >
              <Button.Content visible content={<Icon name={sidebarCollapsed ? 'left arrow' : 'right arrow' } />} />
              <Button.Content hidden content={<Icon name={sidebarCollapsed ? 'eye' : 'eye slash'} />} />
            </Button>
          }
          content={
            activeSidebarTabIs('visualizations') ?
              (sidebarCollapsed ? 'Show menu to change plot queries' : 'Hide menu to show all plots')
            : sidebarCollapsed ? 'Show menu' : 'Hide menu'
          }
        />

        <Divider horizontal />
        {
          showScroll &&
          <Popup
            position='bottom center'
            inverted
            on='hover'
            trigger={
              <Button fluid
                disabled={R.not(showScroll)}
                animated='fade'
                color='black' basic
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              >
                <Button.Content visible content={<Icon name={'up arrow'} />} />
                <Button.Content hidden content={<Icon name={'window maximize outline'} />} />
              </Button>
            }
            content={'Scroll to top'}
          />
        }

      </Sticky>

      
      </Grid.Column>
    </Grid>
    </Ref>
  )
}

export default ResultsPageSidebarPusher