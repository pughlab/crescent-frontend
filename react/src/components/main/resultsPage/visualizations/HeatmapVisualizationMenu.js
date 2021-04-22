import React, { useState, useEffect } from 'react'
import { Button, Segment, Popup, Label, Divider } from 'semantic-ui-react'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import { useDispatch } from 'react-redux'
import { useCrescentContext, useResultsPage } from '../../../../redux/hooks'
import { useGSVAMetricsQuery } from '../../../../apollo/hooks/results'

const HeatmapVisualizationMenu = ({
}) => {
  const { runID } = useCrescentContext()
  const GSVAMetrics = useGSVAMetricsQuery(runID)

  if (R.any(R.isNil, [GSVAMetrics])) {
    return null
  }

  return (
    <>
      <Divider horizontal content='Top Predicted Cluster Labels' />
      <Segment basic style={{padding: 0}} style={{maxHeight: '60vh', overflowY: 'scroll'}}>
      {
        R.map(
            ({cluster, celltype, score}, index) => (
              <Segment fluid key={index}>
                <Label attached='top' content={`Cluster ${cluster}`}/>
                <div>
                  <Label basic size="medium" style={{ margin: '0.25rem' }}>
                    Predicted Cell Type: 
                    <Label.Detail>{celltype}</Label.Detail>
                  </Label>
                </div>
                <div>
                  <Label basic size="medium" style={{ margin: '0.25rem' }}>
                    Enrichment Score: 
                    <Label.Detail>{score}</Label.Detail>
                  </Label>
                </div>
              </Segment>
            ),GSVAMetrics)
      }
      </Segment>
    </>
  )
}

export default HeatmapVisualizationMenu 