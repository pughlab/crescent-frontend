import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label, Message} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import Shake from 'react-reveal/Shake'

import ReferenceDatasets from './ReferenceDatasets'

export default function DataComponent ({

}) {
  const {activeDataAction} = useResultsPage()
  const {runID} = useCrescentContext()

  const dispatch = useDispatch()

  const run = useRunDetailsQuery(runID)
  if (R.any(R.isNil, [run])) {
    return (
      <Segment style={{height: '100%'}} color='violet'>
        <Segment basic style={{ height: '100%' }} placeholder>
          <Tada forever duration={1000}>
            <Image src={Logo} centered size='medium' />
          </Tada>
        </Segment>
      </Segment>
    )
  }

  if (R.isNil(activeDataAction)) {
    return (
      <Segment placeholder style={{height: '100%'}} color='teal'>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          {'Modify run inputs by selecting to the right'}
        </Header>
        </Shake>
      </Segment>
    )
  }


  const activeDataActionIs = R.equals(activeDataAction)

  return (
    <Segment style={{height: '100%'}} color='teal'>
    {
      activeDataActionIs('referenceDatasets') ? <ReferenceDatasets {...{runID}} />
      : null
    }
    </Segment> 
  )
}