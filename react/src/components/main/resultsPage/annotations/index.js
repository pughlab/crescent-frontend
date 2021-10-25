import React, {useState, useEffect, useRef} from 'react';
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label, Message} from 'semantic-ui-react'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import AnnotationsSecondaryRuns from './AnnotationsSecondaryRuns'
import UploadedMetadataList from './UploadedMetadataList'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import Shake from 'react-reveal/Shake'

import UploadRunGenesetButton from './UploadRunGenesetButton'
import UploadRunMetadataButton from './UploadRunMetadataButton'
import InferCNV from './InferCNV'

export default function AnnotationsComponent ({

}) {
  const {activeAnnotationsAction} = useResultsPage()
  const {runID} = useCrescentContext()

  const dispatch = useDispatch()

  // const run = useRunDetailsQuery(runID)
  // if (R.any(R.isNil, [run])) {
  //   return null
  // }

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

  if (R.isNil(activeAnnotationsAction)) {
    return (
      <Segment placeholder style={{height: '100%'}} color='purple'>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          {'Select an annotation method'}
        </Header>
        </Shake>
      </Segment>
    )
  }


  const activeAnnotationsActionIs = R.equals(activeAnnotationsAction)

  return (
    <Segment style={{height: '100%'}} color='purple'>
    {
      activeAnnotationsActionIs('gsva') ? <> <UploadRunGenesetButton {...{runID}} /> </>
      : activeAnnotationsActionIs('runMetadata') ? <> <UploadRunMetadataButton {...{runID}} /> <UploadedMetadataList {...{runID}} /> </>
      : activeAnnotationsActionIs('infercnv') ? <> <InferCNV {...{runID}} /> </>
      : null
    }
    </Segment>
  )
}