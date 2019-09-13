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
    main: null, // 'projects', 'runs', 'vis'
    sidebar: null, // 'dataset', 'pipeline', 'results'
  },
  toggle: {
    projects: {
      activeKind: null
    },
    runs: {},
    vis: {
      dataset: {},
      pipeline: {activeParameter: null},
      result: {activeStep: null}
    }
  },
  // Local or mutable data
  sidebar: {
    parameters: {
      singleCell: 'MTX',
      numberGenes: {min: 50, max: 8000},
      percentMito: {min: 0, max: 0.2},
      resolution: 1,
      principalDimensions: 10,
    }
  }
}

const setParameters = R.set(R.lensPath(['sidebar', 'parameters']))

const setMainView = R.set(R.lensPath(['view', 'main']))
const setSidebarView = R.set(R.lensPath(['view', 'sidebar']))

const setUserFromGQL = R.set(R.lensProp('user'))
const setProjectFromGQL = R.set(R.lensProp('project'))
const setRunFromGQL = R.set(R.lensProp('run'))


const app = (state = initialState, action) => {
  const {type, payload} = action
  switch (type) {
    case 'LOGOUT':
      return initialState
    // GraphQL entrypoints
    // Need to reset selected project and run if new user entrypoint
    // And same for setting new project 
    case 'SET_USER':
      const {user} = payload
      return R.compose(
        setMainView('projects'),
        setRunFromGQL(null),
        setProjectFromGQL(null),
        setUserFromGQL(user)
      )(state)
    case 'SET_PROJECT':
      const {project} = payload
      return R.compose(
        setMainView('runs'),
        setRunFromGQL(null),
        setProjectFromGQL(project)
      )(state)
    case 'SET_RUN':
      const {run} = payload
      return R.compose(
        setSidebarView('dataset'),
        setMainView('vis'),
        setRunFromGQL(run), 
      )(state)
    // App can either be selecting projects and selecting/inspecting runs
    // Inspecting runs require sidebar
    case 'TOGGLE_PROJECTS':
      return R.compose(
        setMainView('projects')
      )(state)
    case 'TOGGLE_RUNS':
      return R.compose(
        setMainView('runs')
      )(state)
    case 'TOGGLE_SIDEBAR':
      const {sidebar} = payload
      return R.compose(
        setSidebarView(sidebar)
      )(state)
    // Toggling different subviews

    // Local data
    case 'SET_PARAMETERS':
      const {parameters} = payload
      return R.compose(
        setParameters(parameters)
      )(state)
    default:
      return state
  }
}

// Combine all reducers for application
export default combineReducers({
  app
})