import React from 'react'
import * as R from 'ramda'
import {Segment, Image, Header} from 'semantic-ui-react'

import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useToolStepsQuery} from '../../../../apollo/hooks'

import Tada from 'react-reveal/Tada'
import Logo from '../../../login/logo.jpg'

const VisualizationsComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)

  if (R.any(R.isNil, [run])) {
    return null
  }

  const {status: runStatus} = run
  if (R.equals('submitted', runStatus)) {
    return (
      <Segment style={{height: '100%'}}>
        <Segment style={{height: '100%'}} basic placeholder>
          <Tada forever duration={1000}>
            <Image src={Logo} centered size='medium' />
          </Tada>
          <Header content='' textAlign='center' />
        </Segment>
      </Segment>
    )
  }
  return (
    <Segment style={{height: '100%'}} color='violet'>      
    </Segment>
  )
}

export default VisualizationsComponent