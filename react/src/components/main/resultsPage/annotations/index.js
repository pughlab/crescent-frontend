import React, {useEffect} from 'react'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import {Header, Icon, Image, Segment} from 'semantic-ui-react'

import {useRunDetailsQuery} from '../../../../apollo/hooks/run'

import {useDispatch} from 'react-redux'
import {setGenesetUploaded} from '../../../../redux/actions/annotations'
import {useAnnotations, useCrescentContext, useResultsPage} from '../../../../redux/hooks'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'
import Shake from 'react-reveal/Shake'

import UploadRunGenesetButton from './UploadRunGenesetButton'
import Metadata from './Metadata'
import InferCNV from './InferCNV'

export default function AnnotationsComponent() {
  const dispatch = useDispatch()
  const {runID} = useCrescentContext()
  const {genesetUploaded} = useAnnotations()
  const {activeAnnotationsAction} = useResultsPage()

  useEffect(() => {
    if (RA.isNotNil(genesetUploaded)) dispatch(setGenesetUploaded({uploaded: null}))
  }, [])

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