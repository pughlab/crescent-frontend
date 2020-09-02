import React from 'react'
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import {Segment, Icon, Header, Image, Grid, Label} from 'semantic-ui-react'
import Shake from 'react-reveal/Shake'

import {useDispatch} from 'react-redux'
import {useResultsPagePlotQuery} from '../../../../redux/hooks/useResultsPage'

export default function CrescentPlotCaption ({
  plotQueryIndex
}) {
  const plotQuery = useResultsPagePlotQuery(plotQueryIndex)
  const {
    activeResult,
    selectedQC,
    selectedQCDataset,
    selectedDiffExpression,
    selectedGroup,
    selectedFeature

  } = plotQuery

  const labels = R.compose(
    R.reject(R.where({detail: R.isNil}))
  )([
    {content: 'Plot', detail: R.toUpper(activeResult)},
    {content: 'Dataset', detail: selectedQCDataset || selectedDiffExpression},
    {content: 'Colour by', detail: selectedGroup},
    {content: 'Feature', detail: selectedFeature},
    {content: 'Quality control', detail: R.equals('qc', activeResult) ? selectedQC : null}
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