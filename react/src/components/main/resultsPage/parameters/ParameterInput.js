import React, {useState, useEffect} from 'react'
import { Button, Segment, Form, Message, Divider, Label, Input, Icon } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import {useToolParameterQuery} from '../../../../apollo/hooks'

////////////////
// TYPES OF INPUT: float, range, integer, select
////////////////
// const FloatParameterInput = ({
//   parameter,
//   // For local state
//   value,
//   setValue
// }) => {
//   const {
//     label,
//     prompt,
//     description,
//     input: {defaultValue, schema, step},
//     disabled,
//   } = parameter
//   const [warning, setWarning] = useState(false)
//   useEffect(
//     () => {
//       schema.isValid(value).then(
//         valid => {
//           setWarning(R.not(valid))
//           console.log('valid float parameter', valid, value, parseFloat(value))
//         }
//       )
//     }, [
//       value
//     ]
//   )
//   return (
//     <ParameterInputMessage {...{parameter}}>
//       <Form>
//         <Form.Input
//           label={label} value={parseFloat(value)} disabled={disabled}
//           error={warning}
//           type='number'
//           step={step}
//           placeholder={parseFloat(defaultValue)}
//           onChange={(e, {value}) => setValue(parseFloat(value))}
//         />
//         <SetToDefaultValueButton {...{defaultValue, setValue, disabled}} />
//       </Form>
//     </ParameterInputMessage>
//   )
// }


const ParameterInput = ({parameterCode}) => {
  const parameter = useToolParameterQuery(parameterCode)
  if (R.isNil(parameter)) {
    return null
  }
  console.log(parameter)
  const {
    prompt,
    description,
    disabled,
    input: {
      type
    }
  } = parameter
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
                'integer'
                // <IntegerParameterInput {...{parameter, value, setValue}} />
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