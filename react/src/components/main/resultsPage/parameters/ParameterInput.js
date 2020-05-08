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
  const {step, parameter, label, disabled, input: {defaultValue}} = toolParameter
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
const FloatParameterInput = ({
  toolParameter
}) => {
  const {step, parameter, label, disabled, input: {defaultValue}} = toolParameter

  const {runID} = useCrescentContext()
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter})
  if (R.isNil(parameterValue)) {
    return null
  }
  return (
    <Form loading={isLoading}>
      <Form.Input type='number' label={label} disabled={disabled}
        // error={warning}
        value={parseFloat(parameterValue)}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value: parseFloat(value)}})}
      />
      <ResetToDefaultValueButton {...{disabled}}
        onClick={() => updateRunParameterValue({variables: {value: parseFloat(defaultValue)}})}
      />
    </Form>
  )
}
const RangeParameterInput = ({
  toolParameter,
}) => {
  const {step, parameter, label, disabled, input: {defaultValue}} = toolParameter
  const {min: defaultMin, max: defaultMax} = defaultValue
  const {runID} = useCrescentContext()
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter})
  if (R.isNil(parameterValue)) {
    return null
  }
  const {min, max} = parameterValue
  return (
    <Form>
      <Form.Group widths={2}>
        <Form.Input disabled={disabled}
          // error={warning}
          type='number'
          step={step}
          placeholder={defaultMin}
          label={`Min ${label}`}
          value={min}
          onChange={(e, {value: newMin}) => updateRunParameterValue({variables: {value: {min: Number(newMin), max}}})}
        />
        <Form.Input disabled={disabled}
          // error={warning}
          step={step}
          type='number'
          placeholder={defaultMax}
          label={`Max ${label}`}
          value={max}
          onChange={(e, {value: newMax}) => updateRunParameterValue({variables: {value: {min, max: Number(newMax)}}})}
        />
      </Form.Group>
      <ResetToDefaultValueButton {...{disabled}}
        onClick={() => updateRunParameterValue({variables: {value: defaultValue}})}
      />
    </Form>
  ) 
}
const SelectParameterInput = ({
  toolParameter
}) => {
  const {step, parameter, label, disabled, input: {defaultValue, options}} = toolParameter

  const {runID} = useCrescentContext()
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter})
  if (R.isNil(parameterValue)) {
    return null
  }
  return (
    <Form loading={isLoading}>
      <Form.Dropdown selection search
        placeholder={defaultValue}
        disabled={disabled}
        options={options}
        label={label}
        value={parameterValue}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value}})}
      />
      <ResetToDefaultValueButton {...{disabled}}
        onClick={() => updateRunParameterValue({variables: {value: defaultValue}})}
      />
    </Form>
  )
}


// 
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
                <RangeParameterInput {...{toolParameter}} />
              )],
              [R.equals('float'), R.always(
                <FloatParameterInput {...{toolParameter}} />
              )],
              [R.equals('integer'), R.always(
                <IntegerParameterInput {...{toolParameter}} />
              )],
              [R.equals('select'), R.always(
                <SelectParameterInput {...{toolParameter}} />
              )],
            ])(type)
          }
        </Segment>
      </Message>
    </Segment>
  )
}

export default ParameterInput