import React, {useState} from 'react'
import { Button, Segment, Form, Message, Divider, Label } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// TODO: add yup validation (define in TOOLS.js)

const ParameterInputMessage = ({
  prompt,
  description,
  disabled,
  children
}) => {
  return (
    <Segment basic disabled={disabled}>
      <Message color='blue'>
        <Message.Header content={prompt} />
        <Message.Content content={description} />
        <Divider horizontal />
        {children}
      </Message>
    </Segment>
  )  
}

// TYPES OF INPUT: float, range, integer

const FloatParameterInput = ({
  parameter: {
    label,
    prompt,
    description,
    input,
    disabled,
  },
  // For local state
  value,
  setValue
}) => {
  const {defaultValue} = input
  return (
    <ParameterInputMessage {...{prompt, description, disabled}}>
      <Form>
        <Form.Input label={label} value={value}
          onChange={(e, {value}) => setValue(value)}
        />
        <Form.Button fluid content='Set to default'
          onClick={() => setValue(defaultValue)}
        />
      </Form>
    </ParameterInputMessage>
  )
}

const IntegerParameterInput = ({
  parameter: {
    label,
    prompt,
    description,
    input,
    disabled,
  },
  // For local state
  value,
  setValue
}) => {
  const {defaultValue} = input
  return (
    <ParameterInputMessage {...{prompt, description, disabled}}>
      <Form>
        <Form.Input label={label} value={value}
          onChange={(e, {value}) => setValue(parseInt(value))}
        />
        <Form.Button fluid content='Set to default'
          onClick={() => setValue(defaultValue)}
        />
      </Form>
    </ParameterInputMessage>
  )
}

const RangeParameterInput = ({
  parameter: {
    label,
    prompt,
    description,
    input,
    disabled,
  },
  // For local state
  value: {min, max},
  setValue
}) => {
  const {defaultValue} = input
  return (
    <ParameterInputMessage {...{prompt, description, disabled}}>
      <Form>
        <Form.Group widths={2}>
          <Form.Input
            label={`Min ${label}`}
            value={min}
            onChange={(e, {value}) => setValue({min: value, max})}
          />
          <Form.Input
            label={`Max ${label}`}
            value={max}
            onChange={(e, {value}) => setValue({min, max: value})}
          />
        </Form.Group>
        <Form.Button fluid content='Set to default'
          onClick={() => setValue(defaultValue)}
        />
      </Form>
    </ParameterInputMessage>
  ) 
}

export default {
  FloatParameterInput,
  IntegerParameterInput,
  RangeParameterInput
}