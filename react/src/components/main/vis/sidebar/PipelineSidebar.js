import React from 'react';

import { Icon, Accordion, Dropdown } from 'semantic-ui-react'

import * as R from 'ramda'

import withRedux from '../../../../redux/hoc'

import TOOLS from '../parameters/TOOLS'

const StepAccordion = withRedux(
  ({
    app: {
      run: {
        status: runStatus
      },
      toggle: {
        vis: {
          pipeline: {
            activeStep: activePipelineStep,
            isSubmitted
          }
        }
      },
    },
    actions: {
      toggle: {setActivePipelineStep,}
    },
    // Props
    step, label
  }) => {
    const isActivePipelineStep = R.equals(activePipelineStep)
    return (
      <>
        <Accordion.Title active={isActivePipelineStep(step)} onClick={() => setActivePipelineStep(step)}>
          {label}
          {
            isActivePipelineStep(step) &&
              <Icon name='eye' color='blue' style={{paddingLeft: 10}} />
          }
        </Accordion.Title>
        <Accordion.Content active={isActivePipelineStep(step)}>
          <Dropdown fluid selection 
            placeholder='Select Tool'
            disabled={R.compose(R.or(isSubmitted), R.not, R.equals('pending'))(runStatus)}
            options={[{value: 'seurat', text: 'SEURAT'}]}
            value={'seurat'}
          />
        </Accordion.Content>
      </>
    )
  }
)

const PipelineSidebar = withRedux(
  () => {
    return (
      <Accordion styled>
      {
        R.compose(
          R.addIndex(R.map)(
            ({step, label}, index) => (<StepAccordion key={index} {...{step, label}} />)
          ),
          R.map(R.pick(['step', 'label'])),
          R.prop('SEURAT')
        )(TOOLS)
      }
      </Accordion>
    )
  }
)

export default PipelineSidebar
