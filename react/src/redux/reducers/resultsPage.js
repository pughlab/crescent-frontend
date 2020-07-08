import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeSidebarTab: 'parameters', // visualizations
  activePipelineStep: null,
  activeResult: null,
  selectedQC: 'Before_After_Filtering',
  selectedFeature: null,
  selectedGroup: null,
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
    'resultsPage/setActiveResult': (state, payload) => {
      const {result} = payload
      return R.evolve({
        activeResult: R.always(result)
      })(state)
    },
    'resultsPage/setSelectedQC': (state, payload) => {
      const {value} = payload
      return R.evolve({
        selectedQC: R.always(value)
      })(state)
    },
    'resultsPage/setSelectedFeature': (state, payload) => {
      const {value} = payload
      return R.evolve({
        selectedFeature: R.always(value)
      })(state)
    },
    'resultsPage/setSelectedGroup': (state, payload) => {
      const {value} = payload
      return R.evolve({
        selectedGroup: R.always(value)
      })(state)
    },

    'resultsPage/reset': R.always(initialState),
  }
)