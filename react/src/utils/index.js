import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const queryIsNotNil = R.curry(
  (query, data) => R.both(
    RA.isNotNilOrEmpty,
    R.propSatisfies(RA.isNotNil, query)
  )(data)
)

export {
  queryIsNotNil
}