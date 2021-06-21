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
            ({cluster, celltype, score}) => (
              <Segment key={cluster}>
                <Label attached='top' content={`Cluster ${cluster}`}/>
                <Popup
                  size={'tiny'}
                  inverted
                  position='top center'
                  trigger={
                    <Button as='div' labelPosition='right'>
                      <Button 
                        basic 
                        size='small'
                        color={R.ifElse(R.equals("UNDEFINED"),R.always('red'),R.always(undefined))(celltype)}
                      >
                        {celltype}
                      </Button>
                      <Label 
                        as='a' 
                        pointing='left' 
                        size='small' 
                        color={R.ifElse(R.equals("NA"),R.always('red'),R.always(undefined))(score)}
                      >
                        {score}
                      </Label>
                    </Button>
                  }
                >
                  <Popup.Content>
                    {'Predicted Label & Enrichment Score'}
                  </Popup.Content>
                </Popup>
              </Segment>
            ),GSVAMetrics)
      }
      </Segment>
    </>
  )
}

export default HeatmapVisualizationMenu 