import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeSidebarTab: 'parameters', // visualizations
  activePipelineStep: null,
}

export default createReducer(
  initialState, {
    'resultsPage/setActiveSidebarTab': (state, payload) => {
      const {sidebarTab} = payload
      return R.evolve({
        activeSidebarTab: R.always(sidebarTab)
      })(state)
    },

    'resultsPage/setActivePipelineStep': (state, payload) => {
      const {pipelineStep} = payload
      return R.evolve({
        activePipelineStep: R.always(pipelineStep)
      })(state)
    },


    'resultsPage/reset': R.always(initialState),
  }
)