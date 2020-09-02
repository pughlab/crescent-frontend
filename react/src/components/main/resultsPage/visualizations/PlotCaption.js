import React from 'react'
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'

import {useDispatch} from 'react-redux'
import {useCrescentContext} from '../../../../redux/hooks'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'
import {useRunDatasetsQuery} from '../../../../apollo/hooks'

export default function CrescentPlotCaption ({
  plotQueryIndex
}) {
  const plotQuery = useResultsPagePlotQuery(plotQueryIndex)
  const {runID} = useCrescentContext()
  const run = useRunDatasetsQuery(runID)
  const {
    activeResult,
    selectedQC,
    selectedQCDataset,
    selectedDiffExpression,
    selectedGroup,
    selectedFeature

  } = plotQuery

  if (R.isNil(run)) {
    return null
  }

  const dataset = R.ifElse(R.isNil, R.identity,
    R.ifElse(R.equals('All'), R.identity,
      datasetID => R.compose(R.prop('name'), R.find(R.propEq('datasetID', datasetID)))(run.datasets)
    )
  )(selectedQCDataset || selectedDiffExpression)

  const labels = R.compose(
    R.reject(R.where({detail: R.isNil}))
  )([
    {content: 'Plot', detail: R.toUpper(activeResult)},
    {content: 'Quality control', detail: R.equals('qc', activeResult) ? selectedQC : null},
    {content: 'Dataset', detail: dataset},
    {content: 'Colour by', detail: selectedGroup},
    {content: 'Feature', detail: selectedFeature},
  ])

  return (
    <Label.Group color='violet'>
      <Label ribbon content={`${R.inc(plotQueryIndex)}`} />
      {
        R.map(({content, detail}) => <Label {...{key: content, content, detail}} />, labels)
      }
    </Label.Group>
  )
}