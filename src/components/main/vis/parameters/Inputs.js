import React, {useState} from 'react'
import { Button, Segment, Form, Message, Divider, Label } from 'semantic-ui-react';

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import PARAMETERS from './PARAMETERS'

const withMessageAbove = R.curry(
    ({parameter, label, prompt, description}, InputComponent) => (
        <Segment basic>
            {/* <Message header={prompt} content={description} color='blue' />
            {InputComponent} */}

            <Message color='blue'>
              <Message.Header content={prompt} />
              <Message.Content content={description} />
              <Divider horizontal>
                {/* <Button content='Default' /> */}
              </Divider>
              {InputComponent}
            </Message>
        </Segment>
    ) 
)

const SingleCellInputType = ({
    singleCell, setSingleCell
}) => {
    const isActive = R.equals(singleCell)
    const activeColor = singleCell => isActive(singleCell) ? 'blue' : undefined
    return withMessageAbove(PARAMETERS[0],
        <Button.Group fluid size='large'>
            <Button content='DGE'
                color={activeColor('DGE')}
                active={isActive('DGE')}
                onClick={() => setSingleCell('DGE')}
            />
            <Button.Or />
            <Button content='MTX'
                color={activeColor('MTX')}
                active={isActive('MTX')}
                onClick={() => setSingleCell('MTX')}
            />
        </Button.Group>
    )
}

const NumberGenes = ({
  numberGenes: {min, max}, setNumberGenes
}) => {
  // console.log(min, max)
  return withMessageAbove(PARAMETERS[1],
    <Form>
      <Form.Group widths={2}>
        <Form.Input label='Min' value={min} onChange={(e, {value}) => setNumberGenes({min: value, max})} />
        <Form.Input label='Max' value={max} onChange={(e, {value}) => setNumberGenes({min, max: value})} />
      </Form.Group>
    </Form>
  )
 
}

const PercentMito = ({
  percentMito: {min, max}, setPercentMito,
}) => {
  // console.log(min, max)
  return withMessageAbove(PARAMETERS[2],
    <Form>
      <Form.Group widths={2}>
        <Form.Input label='Min' value={min} onChange={(e, {value}) => setPercentMito({min: value, max})} />
        <Form.Input label='Max' value={max} onChange={(e, {value}) => setPercentMito({min, max: value})} />
      </Form.Group>
    </Form>
  )
}

const Resolution = ({
    resolution, setResolution
}) => {
    return withMessageAbove(PARAMETERS[3],
      <Form>
        <Form.Input label='Resolution' value={resolution}
          onChange={(e, {value}) => {
            const int = parseInt(value)
            if (RA.isInteger(int)) {
              setResolution(int)
            } else if (R.isEmpty(value)) {
              // Should put default here
              setResolution(resolution)
            }
          }}
        />
      </Form>
    )
}

const PCADimensions = ({
    principalDimensions, setPrincipalDimensions
}) => {
    return withMessageAbove(PARAMETERS[4],
      <Form>
        <Form.Input label='Dimensions' value={principalDimensions}
          onChange={(e, {value}) => {
            const int = parseInt(value)
            if (RA.isInteger(int)) {
              setPrincipalDimensions(int)
            } else if (R.isEmpty(value)) {
              setPrincipalDimensions(principalDimensions)
            }
          }}
        />
      </Form>
    )
}

export {
  SingleCellInputType,
  NumberGenes,
  PercentMito,
  Resolution,
  PCADimensions,
}
