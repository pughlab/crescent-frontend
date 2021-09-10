import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const queryIsNotNil = R.curry(
  (query, data) => R.both(
    RA.isNotNilOrEmpty,
    R.propSatisfies(RA.isNotNil, query)
  )(data)
)

const plotQueryFields = [
  'plotQueryID',
  'activeResult',
  'selectedQC',
  'selectedFeature',
  'selectedFeatures',
  'selectedScaleBy',
  'selectedExpRange',
  'selectedGroup',
  'selectedAssay',
  'selectedDiffExpression',
  'selectedQCDataset',
 ]

// converting selectedExpRange to float, remove __typename, rename id to plotQueryID
 const cleanUpPlotQuery = R.compose(
  // rename id to plotQueryID
  RA.renameKeys({ id: 'plotQueryID'}),
  // keep plotQuery fields, id and runID
  R.pick(R.concat(['id', 'runID'], plotQueryFields)),
  // convert selectedExpRange to float
  R.evolve({
    selectedExpRange: R.map(str => parseFloat(str)),
  })
)

export {
  queryIsNotNil,
  plotQueryFields,
  cleanUpPlotQuery
}