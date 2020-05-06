import createReducer from './createReducer'

const initialState = {
  userID: null,
  projectID: null,
  runID: null,
  view: 'projects' // 'runs' || 'results'
}

export default createReducer(
  initialState, {
    'SET_USER': (state, payload) => {
      return state
    },
    'SET_MAIN_VIEW': (state, payload) => {
      const {view} = payload
      return state
    },
  }
)