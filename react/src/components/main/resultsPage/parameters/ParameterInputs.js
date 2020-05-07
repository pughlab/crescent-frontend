import React, {useState, useEffect} from 'react'
import { Button, Segment, Form, Message, Divider, Label, Input, Icon } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// TODO: use formik with yup once pipeline gets more advanced and we have more parameter types

// Component for displaying parameter details
const ParameterInputMessage = ({
  parameter: {
    prompt,
    description,
    disabled,
    input: {
      type
    }
  },
  children
}) => {
  return (
    <Segment basic>
      <Message color='blue'>
        <Message.Header content={prompt} />
        <Message.Content content={description} />
        <Divider horizontal />
        <Segment>
          <Label attached='top left' content={R.toUpper(type)} />
          {children}
        </Segment>
      </Message>
    </Segment>
  )  
}

// Button to reset whatever input to its default value
const SetToDefaultValueButton = ({
  setValue,
  defaultValue,
  disabled
}) => (
  R.not(disabled) &&
  <Form.Button fluid
    animated='vertical'
    onClick={() => setValue(defaultValue)}
  >
    <Button.Content visible>
    {
      disabled ? 'Set to default value' : <Icon name='undo' />
    }
    </Button.Content>
    <Button.Content hidden content={disabled ? 'You can not change this value' : 'Reset to default value?'} />
  </Form.Button>
)

////////////////
// TYPES OF INPUT: float, range, integer, select
////////////////
const FloatParameterInput = ({
  parameter,
  // For local state
  value,
  setValue
}) => {
  const {
    label,
    prompt,
    description,
    input: {defaultValue, schema, step},
    disabled,
  } = parameter
  const [warning, setWarning] = useState(false)
  useEffect(
    () => {
      schema.isValid(value).then(
        valid => {
          setWarning(R.not(valid))
          console.log('valid float parameter', valid, value, parseFloat(value))
        }
      )
    }, [
      value
    ]
  )
  return (
    <ParameterInputMessage {...{parameter}}>
      <Form>
        <Form.Input
          label={label} value={parseFloat(value)} disabled={disabled}
          error={warning}
          type='number'
          step={step}
          placeholder={parseFloat(defaultValue)}
          onChange={(e, {value}) => setValue(parseFloat(value))}
        />
        <SetToDefaultValueButton {...{defaultValue, setValue, disabled}} />
      </Form>
    </ParameterInputMessage>
  )
}

const IntegerParameterInput = ({
  parameter,
  // For local state
  value,
  setValue
}) => {
  const {
    label,
    prompt,
    description,
    input: {defaultValue, schema},
    disabled,
  } = parameter
  const [warning, setWarning] = useState(false)
  useEffect(
    () => {
      schema.isValid(value).then(
        valid => {
          setWarning(R.not(valid))
          console.log('valid integer parameter', valid, value, parseInt(value))
        }
      )
    }, [
      value
    ]
  )
  return (
    <ParameterInputMessage {...{parameter}}>
      <Form>
        <Form.Input
          label={label} value={parseInt(value)} disabled={disabled}
          type='number'
          error={warning}
          onChange={(e, {value}) => setValue(parseInt(value))}
        />
        <SetToDefaultValueButton {...{defaultValue, setValue, disabled}} />
      </Form>
    </ParameterInputMessage>
  )
}

const RangeParameterInput = ({
  parameter,
  // For local state
  value,
  setValue
}) => {
  const {
    label,
    prompt,
    description,
    input: {defaultValue, schema, step},
    disabled,
  } = parameter
  const {min, max} = value
  const {min: defaultMin, max: defaultMax} = defaultValue
  const [warning, setWarning] = useState(false)
  useEffect(
    () => {
      schema.isValid(value).then(
        valid => {
          setWarning(R.not(valid))
          console.log('valid range parameter', valid, value)
        }
      )
    }, [
      value
    ]
  )
  return (
    <ParameterInputMessage {...{parameter}}>
      <Form>
        <Form.Group widths={2}>
          <Form.Input disabled={disabled}
            error={warning}
            type='number'
            step={step}
            placeholder={defaultMin}
            label={`Min ${label}`}
            value={min}
            onChange={(e, {value: newMin}) => setValue({min: Number(newMin), max})}
          />
          <Form.Input disabled={disabled}
            error={warning}
            step={step}
            type='number'
            placeholder={defaultMax}
            label={`Max ${label}`}
            value={max}
            onChange={(e, {value: newMax}) => setValue({min, max: Number(newMax)})}
          />
        </Form.Group>
        <SetToDefaultValueButton {...{defaultValue, setValue, disabled}} />
      </Form>
    </ParameterInputMessage>
  ) 
}

const SelectParameterInput = ({
  parameter,
  // For local state
  value,
  setValue
}) => {
  const {
    label,
    prompt,
    description,
    input: {defaultValue, options},
    disabled,
  } = parameter
  return (
    <ParameterInputMessage {...{parameter}}>
      <Form>
        <Form.Dropdown
          selection
          search
          placeholder={defaultValue}
          disabled={disabled}
          options={options}
          label={label}
          value={value}
          onChange={(e, {value}) => setValue(value)}
        />
        <SetToDefaultValueButton {...{defaultValue, setValue, disabled}} />
      </Form>
    </ParameterInputMessage>
  ) 
}

export {
  FloatParameterInput,
  IntegerParameterInput,
  RangeParameterInput,
  SelectParameterInput
}