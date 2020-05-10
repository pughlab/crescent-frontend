import React from 'react'
import * as R from 'ramda'

import {Segment, Transition, Header, Icon} from 'semantic-ui-react'

import PipelineParameter from './PipelineParameter'
import QualityControlParametersComponent from './QualityControl'

import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useToolStepsQuery} from '../../../../apollo/hooks'


import Shake from 'react-reveal/Shake'

const ParametersComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {activePipelineStep} = useResultsPage()
  const toolSteps = useToolStepsQuery()

  if (R.any(R.isNil, [run, toolSteps])) {
    return null
  }

  const {status: runStatus} = run
  if (R.isNil(activePipelineStep)) {
    return (
      <Segment placeholder style={{height: '100%'}}>
        <Shake forever duration={10000}>
        <Header textAlign='center' icon>
          <Icon name='right arrow' />
          {
            R.ifElse(
              R.equals('pending'),
              R.always('Select a pipeline step on the right to configure parameters'),
              R.always('Parameters have already been configured and job submitted')
            )(runStatus)
          }
        </Header>
        </Shake>
      </Segment>
    )
  }

  return (
    <Segment style={{height: '100%'}} color='blue'>
    {
      R.equals('quality', activePipelineStep) ? 
        <QualityControlParametersComponent />
      : 
        R.compose(
          R.map(
            ({parameter: parameterCode}) => (
              <PipelineParameter key={parameterCode} {...{parameterCode}} />
            )
          ),
          R.prop('parameters'),
          R.find(R.propEq('step', activePipelineStep))
        )(toolSteps)
      }
    </Segment>
  )
}

export default ParametersComponent