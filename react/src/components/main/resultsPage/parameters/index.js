import React from 'react'
import * as R from 'ramda'

import {Segment, Transition, Header, Icon} from 'semantic-ui-react'

import TOOLS from '../TOOLS'
import {
  FloatParameterInput,
  IntegerParameterInput,
  RangeParameterInput,
  SelectParameterInput
} from './ParameterInputs'

import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks'


import Shake from 'react-reveal/Shake'

const ParametersComponent = ({

}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {activePipelineStep} = useResultsPage()

  if (R.isNil(run)) {
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
        R.compose(
          R.addIndex(R.map)(
            (parameter, index) => {
              const {parameter: parameterName, input: {type, defaultValue}, disabled} = parameter
              const setValue = undefined
              const value = defaultValue
              // const setValue = R.prop(parameterName, valueSetters)
              // const value = R.prop(parameterName, values)
              return R.cond([
                [R.equals('range'), R.always(
                  <RangeParameterInput
                    {...{parameter, value, setValue}}
                  />
                )],
                [R.equals('float'), R.always(
                  <FloatParameterInput
                    {...{parameter, value, setValue}}
                  />
                )],
                [R.equals('integer'), R.always(
                  <IntegerParameterInput
                    {...{parameter, value, setValue
                    }}
                  />
                )],
                [R.equals('select'), R.always(
                  <SelectParameterInput
                    {...{parameter, value, setValue}}
                  />
                )],
              ])(type)
            },
          ),
          R.prop('parameters'),
          R.find(R.propEq('step', activePipelineStep)),
          R.prop('SEURAT')
        )(TOOLS)
      }
    </Segment>
  )
}

export default ParametersComponent