import React, {useState, useEffect, useRef} from 'react';

import { Segment, Button, Icon, Step, Header, Dropdown, Form, Divider, Menu, Label } from 'semantic-ui-react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useDispatch} from 'react-redux'
import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'
import {useResultsAvailableQuery} from '../../../../apollo/hooks/results'

const LogsSidebar = ({
}) => {    
  const {runID} = useCrescentContext()

  const run = useRunDetailsQuery(runID)

  const dispatch = useDispatch()
  const {activeResult} = useResultsPage()
  const isActiveResult = R.equals(activeResult)

  const plots = useResultsAvailableQuery(runID)

  if (R.any(R.isNil, [run, plots])) {
    return null
  }
  const {status: runStatus} = run

  const runIsNotSubmitted = R.not(R.equals('submitted', runStatus))
  if (runIsNotSubmitted) {return null}

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name='exclamation' />
        The pipeline is currently running.
      </Header>
    </Segment>
  )
}

export default LogsSidebar