import createReducer from './createReducer'

const initialState = {
  userID: null,
  isGuest: true,
  projectID: null,
  runID: null,
  view: 'projects' // 'runs' || 'results'
}

export default createReducer(
  initialState, {
    'SET_USER': (state, payload) => {
      const {user} = payload
      return state
    },
    'SET_MAIN_VIEW': (state, payload) => {
      const {view} = payload
      return state
    },
  }
)