import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label, Message} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import Shake from 'react-reveal/Shake'

import UploadRunMetadataButton from './UploadRunMetadataButton'
import ReferenceDatasets from './ReferenceDatasets'

export default function DataComponent ({

}) {
  const {activeDataAction} = useResultsPage()
  const {runID} = useCrescentContext()

  const dispatch = useDispatch()

  const run = useRunDetailsQuery(runID)
  if (R.any(R.isNil, [run])) {
    return null
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
      : activeDataActionIs('runMetadata') ? <UploadRunMetadataButton {...{runID}} />
      : null
    }
    </Segment> 
  )
}