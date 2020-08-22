import React, {useState, useEffect} from 'react'
import { Button, Segment, Form, Message, Divider, Label, Input, Icon } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext} from '../../../../redux/hooks'
import {useToolParameterQuery, useRunDetailsQuery} from '../../../../apollo/hooks'

import {
  IntegerParameterInput,
  FloatParameterInput,
  RangeParameterInput,
  SelectParameterInput,
  MultiSelectParameterInput,
} from './ParameterInputs'

// 
const PipelineParameter = ({
  parameterCode,
  // In case of quality control parameters
  datasetID
}) => {
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const toolParameter = useToolParameterQuery(parameterCode)

  if (R.any(R.isNil, [toolParameter, run])) {
    return null
  }
  const {prompt, step, parameter, description, disabled, input: {type}} = toolParameter
  const {status: runStatus} = run
  return (
    <Segment basic>
      <Message color='blue'>
        <Message.Header content={prompt} />
        <Message.Content content={description} />
        <Divider horizontal />
        <Segment disabled={disabled}>
          <Label attached='top left' content={R.toUpper(type)} />
          {
            R.cond([
              [R.equals('range'), R.always(
                <RangeParameterInput {...{toolParameter, datasetID}} />
              )],
              [R.equals('float'), R.always(
                <FloatParameterInput {...{toolParameter, datasetID}} />
              )],
              [R.equals('integer'), R.always(
                <IntegerParameterInput {...{toolParameter, datasetID}} />
              )],
              [R.equals('select'), R.always(
                <SelectParameterInput {...{toolParameter, datasetID}} />
              )],
              [R.equals('multiSelect'), R.always(
                <MultiSelectParameterInput {...{toolParameter, datasetID}} />
              )],
            ])(type)
          }
        </Segment>
      </Message>
    </Segment>
  )
}

export default PipelineParameter