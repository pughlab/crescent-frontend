import React from 'react'
import * as R from 'ramda'

import {Accordion, Dropdown, Icon} from 'semantic-ui-react'

import Fade from 'react-reveal/Fade'

import {useDispatch} from 'react-redux'
import {useResultsPage, useCrescentContext} from '../../../../redux/hooks'
import {useRunDetailsQuery, useToolStepsQuery} from '../../../../apollo/hooks'

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
  const toolSteps = useToolStepsQuery()
  if (R.isNil(toolSteps)) {
    return null
  }
  return (
    <Accordion styled>
    {
      R.map(
        ({step, label}) => (
          <ParameterAccordionItem key={step} {...{step, label}} />
        ),
        toolSteps
      )
    }
    </Accordion>
  )
}

export default ParametersSidebar