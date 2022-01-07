import React from 'react'
import * as R from 'ramda'
import {Header, Icon, Image, Segment} from 'semantic-ui-react'

import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import {useCrescentContext, useResultsPage} from '../../../../redux/hooks'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import Shake from 'react-reveal/Shake'

import UploadRunGenesetButton from './UploadRunGenesetButton'
import Metadata from './Metadata'
import InferCNV from './InferCNV'
import useSecondaryRunMachine from '../../../../redux/helpers/machines/SecondaryRunMachine/useSecondaryRunMachine'

export default function AnnotationsComponent() {
  const {runID} = useCrescentContext()
  const {activeAnnotationsAction} = useResultsPage()

  // Initialize the secondary run machine to its initial state
  useSecondaryRunMachine()

  const {run} = useRunDetailsQuery(runID)

  if (R.isNil(run)) {
    return (
      <Segment color="purple" style={{height: '100%'}}>
        <Segment basic placeholder style={{height: '100%'}}>
          <Tada forever duration={1000}>
            <Image centered size="medium" src={Logo} />
          </Tada>
        </Segment>
      </Segment>
    )
  }

  if (R.isNil(activeAnnotationsAction)) {
    return (
      <Segment color="purple" style={{height: '100%'}}>
        <Segment placeholder style={{height: '100%'}}>
          <Shake forever duration={10000}>
            <Header icon textAlign="center">
              <Icon name="right arrow" />
              {'Select an annotation method'}
            </Header>
          </Shake>
        </Segment>
      </Segment>
    )
  }

  const activeAnnotationsActionIs = R.equals(activeAnnotationsAction)

  return (
    <Segment color="purple" style={{height: '100%'}}>
      {
        activeAnnotationsActionIs('gsva') ? <UploadRunGenesetButton {...{runID}} />
        : activeAnnotationsActionIs('runMetadata') ? <Metadata {...{runID}} />
        : activeAnnotationsActionIs('infercnv') ? <InferCNV {...{runID}} />
        : null
      }
    </Segment>
  )
}