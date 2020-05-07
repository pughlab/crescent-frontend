import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeRunsFilter: 'all' // pending || submitted || completed || failed
}

export default createReducer(
  initialState, {
    'runsPage/setActiveRunsFilter': (state, payload) => {
      const {runsFilter} = payload
      return R.evolve({
        activeRunsFilter: R.always(runsFilter)
      })(state)
    },

    'runsPage/reset': R.always(initialState),
  }
)