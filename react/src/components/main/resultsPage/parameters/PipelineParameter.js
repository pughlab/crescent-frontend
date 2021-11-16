import React from 'react'
import {Divider, Label, Message, Segment} from 'semantic-ui-react';

import * as R from 'ramda'

import {useResultsPage} from '../../../../redux/hooks'
import {useToolParameterQuery} from '../../../../apollo/hooks/run'

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
  const {runStatus} = useResultsPage()
  const toolParameter = useToolParameterQuery(parameterCode)

  if (R.any(R.isNil, [toolParameter, runStatus])) {
    return null
  }
  const {prompt, step, parameter, description, disabled, input: {type}} = toolParameter
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