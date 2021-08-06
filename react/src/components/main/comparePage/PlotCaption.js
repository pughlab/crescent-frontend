import React from 'react'
import * as R from 'ramda'

import {Label} from 'semantic-ui-react'

import {useRunDetailsQuery} from '../../../apollo/hooks/run'
import {useResultsPagePlotQuery} from '../../../redux/hooks/useResultsPage'

export default function PlotCaption ({
  plotQueryIndex
}) {
  const {
    runID,
    activeResult,
    selectedQC,
    selectedQCDataset,
    selectedDiffExpression,
    selectedGroup,
    selectedFeature
  } = useResultsPagePlotQuery(plotQueryIndex)
  const run = useRunDetailsQuery(runID)

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
    {content: 'Project', detail: run.project.name},
    {content: 'Run', detail: run.name},
    {content: 'Plot', detail: R.toUpper(activeResult)},
    {content: 'Dataset', detail: dataset},
    {content: 'Quality Control', detail: R.equals('qc', activeResult) ? selectedQC : null},
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