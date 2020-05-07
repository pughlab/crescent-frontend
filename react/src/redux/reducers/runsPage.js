import createReducer from './createReducer'

const initialState = {
  activeRunsFilter: 'all'
}

export default createReducer(
  initialState, {
    'runsPage/setActiveRunsFilter': (state, payload) => {
      
      return state
    }
  }
)