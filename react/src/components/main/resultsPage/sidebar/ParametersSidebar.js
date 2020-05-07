import React from 'react'
import * as R from 'ramda'

import {Accordion, Dropdown, Icon} from 'semantic-ui-react'

import TOOLS from '../TOOLS'

import Fade from 'react-reveal/Fade'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery} from '../../../../apollo/hooks'

import {setActivePipelineStep} from '../../../../redux/actions/resultsPage'

const ParameterAccordionItem = ({
  step, label
}) => {
  const dispatch = useDispatch()
  const {activePipelineStep} = useResultsPage()

  const {runID} = useCrescentContext()
  const run = useRunDetailsQuery(runID)
  if (R.isNil(run)) {
    return null
  }

  const {status: runStatus} = run
  console.log(step, activePipelineStep)
  const active = R.equals(step, activePipelineStep)
  const runStatusIsPending = R.equals('pending', runStatus)
  return (
    <>
      <Accordion.Title active={active}
        onClick={() => dispatch(setActivePipelineStep({pipelineStep: step}))}
      >
        {label}
        {active && <Icon name='eye' color='blue' style={{paddingLeft: 10}} />}
      </Accordion.Title>
      <Accordion.Content active={active}>
        <Dropdown fluid selection 
          placeholder='Select Tool'
          disabled={runStatusIsPending}
          options={[{value: 'seurat', text: 'SEURAT'}]}
          value={'seurat'}
        />
      </Accordion.Content>
    </>
  )
}

const ParametersSidebar = ({

}) => {
  return (
    <Accordion styled>
    {
      R.compose(
        R.addIndex(R.map)(
          ({step, label}, index) => (
            <ParameterAccordionItem key={index} {...{step, label}} />
          )
        ),
        R.map(R.pick(['step', 'label'])),
        R.prop('SEURAT')
      )(TOOLS)
    }
    </Accordion>
  )
}

export default ParametersSidebar