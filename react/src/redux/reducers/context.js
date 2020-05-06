import createReducer from './createReducer'

const initialState = {
  userID: null,
  projectID: null,
  runID: null,
  view: 'projects' // 'runs' || 'results'
}

export default createReducer(
  initialState, {

  }
)