import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label, Divider} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'


import Logs from './Logs'

import Tada from 'react-reveal/Tada'
import Fade from 'react-reveal/Fade'
import Logo from '../../../login/logo.jpg'
import {ClimbingBoxLoader} from 'react-spinners'
import {Button} from 'semantic-ui-react'

const LogsComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()
  const {activeResult, activePlot, plotQueries, sidebarCollapsed, activeSidebarTab} = useResultsPage()
  const [showLogs, setShowLogs] = useState(false)

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status: runStatus} = run

  return (
    <Segment style={{height: '100%'}} color='red'>
      <Segment basic placeholder>
        <Tada forever duration={1000}>
          <Image src={Logo} centered size='medium' />
        </Tada>
        <Divider horizontal hidden />
        <Logs />
      </Segment>
    </Segment> 
  )
}

export default LogsComponent