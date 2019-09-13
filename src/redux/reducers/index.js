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
    main: null, // 'projects', 'runs'
    sidebar: null, // 'dataset', 'pipeline', 'results'
  }
}

const setViewToProjects = R.set(
  R.lensPath(['view', 'main']),
  'projects'
)
const setViewToVis = R.set(
  R.lensPath(['view', 'main']),
  'vis'
)
const setViewToRuns = R.set(
  R.lensPath(['view', 'main']),
  'runs'
)
const setMainView = R.set(R.lensPath(['view', 'main']))
const setSidebarView = R.set(R.lensPath(['view', 'sidebar']))

const setUserFromGraphQL = R.set(R.lensProp('user'))
const setProjectFromGQL = R.set(R.lensProp('project'))
const setRunFromGQL = R.set(R.lensProp('run'))

const app = (state = initialState, action) => {
  const {type, payload} = action
  switch (type) {
    case 'SET_USER':
      const {user} = payload
      return R.compose(
        setMainView('projects'),
        setUserFromGraphQL(user)
      )(state)
    case 'SET_PROJECT':
      const {project} = payload
      return R.compose(
        setMainView('runs'),
        setProjectFromGQL(project)
      )(state)
    case 'SET_RUN':
      const {run} = payload
      return R.compose(
        setSidebarView('dataset'),
        setMainView('vis'),
        setRunFromGQL(run), 
      )(state)
    case 'TOGGLE_PROJECTS':
      return R.compose(
        setMainView('projects')
      )(state)
    case 'TOGGLE_SIDEBAR':
      const {sidebar} = payload
      return R.compose(
        setSidebarView(sidebar)
      )(state)
    default:
      return state
  }
}

// Combine all reducers for application
export default combineReducers({
  app
})