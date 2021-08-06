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

export {
  queryIsNotNil,
  plotQueryFields
}