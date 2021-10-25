import React, {useState, useEffect} from 'react'
import { Button, Segment, Form, Message, Divider, Label, Input, Icon } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useUpdateRunParameterMutation} from '../../../../apollo/hooks/run'

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
  datasetID
}) => {
  const {step, parameter, label, disabled, input: {defaultValue, step: increaseStep}} = toolParameter
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter, datasetID})
  if (R.any(R.isNil, [run, parameterValue])) {
    return null
  }
  const {status: runStatus} = run
  const disableInput = R.or(disabled, R.not(R.equals('pending', runStatus)))
  
  const valueTransform = value => R.isNil(datasetID) ? parseInt(value) : {value: parseInt(value), datasetID}
  return (
    // <Form loading={isLoading}>
    <Form>
      <Form.Input
        type='number'
        label={label}
        disabled={disableInput}
        step={increaseStep}
        // error={warning}
        value={parseInt(parameterValue)}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value: valueTransform(value)}})}
      />
      {
        R.not(disableInput) &&
        <ResetToDefaultValueButton {...{disabled}}
          onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
        />
      }
    </Form>
  )
}
const FloatParameterInput = ({
  toolParameter,
  datasetID
}) => {
  const {step, parameter, label, disabled, input: {defaultValue, step: increaseStep}} = toolParameter

  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter, datasetID})
  if (R.any(R.isNil, [run, parameterValue])) {
    return null
  }
  const {status: runStatus} = run
  const disableInput = R.or(disabled, R.not(R.equals('pending', runStatus)))
  const valueTransform = value => R.isNil(datasetID) ? parseFloat(value) : {value: parseFloat(value), datasetID}
  return (
    // <Form loading={isLoading}>
    <Form>
      <Form.Input
        type='number'
        label={label}
        disabled={disableInput}
        step={increaseStep}
        // error={warning}
        value={parseFloat(parameterValue)}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value: valueTransform(value)}})}
      />
      {
        R.not(disableInput) &&
        <ResetToDefaultValueButton {...{disabled}}
          onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
        />
      }
    </Form>
  )
}
const RangeParameterInput = ({
  toolParameter,
  datasetID
}) => {
  const {step, parameter, label, disabled, input: {defaultValue, step: increaseStep}} = toolParameter
  const {min: defaultMin, max: defaultMax} = defaultValue
  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter, datasetID})
  if (R.any(R.isNil, [run, parameterValue])) {
    return null
  }

  const {status: runStatus} = run
  const disableInput = R.or(disabled, R.not(R.equals('pending', runStatus)))

  const {min, max} = parameterValue

  const valueTransform = value => R.isNil(datasetID) ? value : {value, datasetID}
  return (
    <Form>
      <Form.Group widths={2}>
        <Form.Input
          disabled={disableInput}
          // error={warning}
          type='number'
          step={increaseStep}
          placeholder={defaultMin}
          label={`Min ${label}`}
          value={min}
          onChange={(e, {value: newMin}) => updateRunParameterValue({variables: {value: valueTransform({min: Number(newMin), max})}})}
        />
        <Form.Input
          disabled={disableInput}
          // error={warning}
          step={increaseStep}
          type='number'
          placeholder={defaultMax}
          label={`Max ${label}`}
          value={max}
          onChange={(e, {value: newMax}) => updateRunParameterValue({variables: {value: valueTransform({min, max: Number(newMax)})}})}
        />
      </Form.Group>
      {
        R.not(disableInput) && 
        <ResetToDefaultValueButton {...{disabled}}
          onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
        />
      }
    </Form>
  ) 
}

const SelectParameterInput = ({
  toolParameter,
  datasetID
}) => {
  const {step, parameter, label, disabled, input: {defaultValue, options}} = toolParameter

  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter, datasetID})
  if (R.any(R.isNil, [run, parameterValue])) {
    return null
  }
  const {status: runStatus} = run
  const disableInput = R.or(disabled, R.not(R.equals('pending', runStatus)))
  const valueTransform = value => R.isNil(datasetID) ? value : {value, datasetID}
  return (
    // <Form loading={isLoading}>
    <Form>
      <Form.Dropdown selection search
        placeholder={defaultValue}
        disabled={disableInput}
        options={options}
        label={label}
        value={parameterValue}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value: valueTransform(value)}})}
      />
      {
        R.not(disableInput) && 
        <ResetToDefaultValueButton {...{disabled}}
          onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
        />
      }
    </Form>
  )
}

const MultiSelectParameterInput = ({
  toolParameter,
  datasetID
}) => {
  const {step, parameter, label, disabled, input: {defaultValue, options}} = toolParameter

  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  const {parameterValue, updateRunParameterValue, isLoading} = useUpdateRunParameterMutation({runID, step, parameter, datasetID})
  if (R.any(R.isNil, [run, parameterValue])) {
    return null
  }
  const {status: runStatus} = run
  const disableInput = R.or(disabled, R.not(R.equals('pending', runStatus)))
  const valueTransform = value => R.isNil(datasetID) ? value : {value, datasetID}
  return (
    // <Form loading={isLoading}>
    <Form>
      <Form.Dropdown 
        selection 
        search
        multiple
        placeholder={'Select one or more DEG comparisons'}
        defaultValue={defaultValue}
        // placeholder={defaultValue}
        disabled={disableInput}
        options={options}
        label={label}
        value={parameterValue}
        onChange={(e, {value}) => updateRunParameterValue({variables: {value: valueTransform(value)}})}
      />
      {
        R.not(disableInput) && 
        <ResetToDefaultValueButton {...{disabled}}
          onClick={() => updateRunParameterValue({variables: {value: valueTransform(defaultValue)}})}
        />
      }
    </Form>
  )
}


export {
  IntegerParameterInput,
  FloatParameterInput,
  RangeParameterInput,
  SelectParameterInput,
  MultiSelectParameterInput,
} 