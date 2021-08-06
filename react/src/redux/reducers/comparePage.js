import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  selectedPlotID: null,
  plotQueries: []
}

export default createReducer(
  initialState, {
    'comparePage/reset': R.always(initialState),

    // save selected plotID and plot queries so we can return to compare page
    'comparePage/cacheComparePage': (state, payload) => {
      const {plotQueries: comparePagePlots} = state
      const {plotQueryID, plotQueries: resultsPagePlots} = payload
      return R.evolve({
        selectedPlotID: R.always(plotQueryID),
        plotQueries: R.always(R.isNil(resultsPagePlots) ? comparePagePlots : resultsPagePlots)
      })(state)
    },

  }
)