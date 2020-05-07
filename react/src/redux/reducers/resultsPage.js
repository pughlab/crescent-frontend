import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeSidebarTab: 'parameters' // visualizations
}

export default createReducer(
  initialState, {
    'resultsPage/setActiveSidebarTab': (state, payload) => {
      const {sidebarTab} = payload
      console.log(sidebarTab)
      return R.evolve({
        activeSidebarTab: R.always(sidebarTab)
      })(state)
    },

    'resultsPage/reset': R.always(initialState),
  }
)