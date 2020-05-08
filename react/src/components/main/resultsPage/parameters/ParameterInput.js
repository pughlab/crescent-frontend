import React, {useState, useEffect} from 'react'
import { Button, Segment, Form, Message, Divider, Label, Input, Icon } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext} from '../../../../redux/hooks'
import {useToolParameterQuery, useUpdateRunParameterMutation} from '../../../../apollo/hooks'

// Button to reset whatever input to its default value
const ResetToDefaultValueButton = ({
  onClick,
  disabled
}) => (
  R.not(disabled) &&
  <Form.Button fluid animated='vertical'
    onClick={() => onClick()}
  >
    <Button.Content visible content={disabled ? 'Set to default value' : <Icon name='undo' />} />
    <Button.Content hidden content={disabled ? 'You can not change this value' : 'Reset to default value?'} />
  </Form.Button>
)


////////////////
// TYPES OF INPUT: float, range, integer, select
////////////////
const IntegerParameterInput = ({
  toolParameter,
}) => {
  const {
    step,
    parameter,
    label,
    disabled,
    input: {
      defaultValue
    }
  } = toolParameter
  const {runID} = useCrescentContext()
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter})
  

  if (R.isNil(parameterValue)) {
    return null
  }

  return (
    <Form loading={isLoading}>
      <Form.Input type='number' label={label} disabled={disabled}
        // error={warning}
        value={parseInt(parameterValue)}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value: parseInt(value)}})}
      />
      <ResetToDefaultValueButton {...{disabled}}
        onClick={() => updateRunParameterValue({variables: {value: parseInt(defaultValue)}})}
      />
    </Form>
  )
}

const ParameterInput = ({parameterCode}) => {
  const toolParameter = useToolParameterQuery(parameterCode)

  if (R.any(R.isNil, [toolParameter])) {
    return null
  }
  const {
    prompt,
    step,
    parameter,
    description,
    disabled,
    input: {
      type
    }
  } = toolParameter
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
                'range'
                // <RangeParameterInput {...{parameter, value, setValue}} />
              )],
              [R.equals('float'), R.always(
                'float'
                // <FloatParameterInput {...{parameter, value, setValue}} />
              )],
              [R.equals('integer'), R.always(
                <IntegerParameterInput {...{toolParameter}} />
              )],
              [R.equals('select'), R.always(
                'select'
                // <SelectParameterInput {...{parameter, value, setValue}} />
              )],
            ])(type)
          }
        </Segment>
      </Message>
    </Segment>
  )
}

export default ParameterInput