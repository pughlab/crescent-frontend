import { combineReducers } from 'redux'
import * as R from 'ramda'

// Reducer
const initialState = {
  // Data from GQL
  user: null, // {userID, sessionToken, projects}
  project: null, // {}
  run: null,
  // View management
  view: {
    // Note:
    // 'runs' need projectID
    // 'vis' need runID
    main: null, // 'runs'
    sidebar: null, // 'dataset', 'pipeline', 'results'
  }
}
const app = (state = initialState, action) => {
  const {type, payload} = action
  switch (type) {
    case 'SET_USER':
      const {user} = payload
      const setUserFromGraphQL = R.set(
        R.lensProp('user'),
        user
      )
      const setViewToProjects = R.set(
        R.lensPath(['view', 'main']),
        'projects'
      )
      return R.compose(
        setViewToProjects,
        setUserFromGraphQL
      )(state)
    case 'SET_PROJECT':
      const {project} = payload
      const setProjectFromGQL = R.set(
        R.lensProp('project'),
        project
      )
      const setViewToRuns = R.set(
        R.lensPath(['view', 'main']),
        'runs'
      )
      return R.compose(
        setViewToRuns,
        setProjectFromGQL
      )(state)
    case 'SET_RUN':
        const {run} = payload
        const setRunFromGQL = R.set(
          R.lensPath(['view', 'runID']),
          run
        )
        const setViewToVis = R.set(
          R.lensPath(['view', 'main']),
          'vis'
        )
        return R.compose(
          setRunFromGQL, 
          setViewToVis,
        )(state)
    default:
      return state
  }
}

// Combine all reducers for application
export default combineReducers({
  app
})