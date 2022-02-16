import React from 'react'
import { Divider, Form } from 'semantic-ui-react'

import * as R from 'ramda'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useResultsPagePlotQuery } from '../../../../redux/hooks/useResultsPage'
import { useInferCNVTypes, useMachineService } from '../../../../apollo/hooks/results'
import { setInferCNVType } from '../../../../redux/slices/resultsPage'

import { Fade } from 'react-reveal'

const InferCNVHeatmapVisualizationMenu = ({
}) => {
  const dispatch = useDispatch()
  const { runID } = useCrescentContext()
  const { activePlot } = useResultsPage()
  const { selectedInferCNVType } = useResultsPagePlotQuery(activePlot)
  const inferCNVTypes = useInferCNVTypes(runID)
  const [current, send] = useMachineService()

  if (R.any(R.isNil, [inferCNVTypes])) {
    return null
  }

  return (
    <Fade>
      <Divider horizontal content='Type' />
        <Form>
        <Form.Field>
          <Form.Dropdown fluid selection upward
            value={selectedInferCNVType}
            options={inferCNVTypes}
            onChange={(e, { value }) => dispatch(setInferCNVType({ value, send }))}
            disabled={R.test(/.*Loading/, current.value)}
          />
        </Form.Field>
        </Form>
    </Fade>
  )
}

export default InferCNVHeatmapVisualizationMenu 