import { combineReducers } from 'redux'
import * as R from 'ramda'

// CONSTANTS
import PARAMETERS from '../../components/main/vis/parameters/PARAMETERS'

// Reducer
const initialState = {
  // Data from GQL
  user: null, // {userID, sessionToken, projects}
  project: null, // {}
  run: null,
  // View management
  view: {
    main: 'projects', // 'login', 'projects', 'runs', 'vis'
    sidebar: null, // 'dataset', 'pipeline', 'results'
  },
  toggle: {
    projects: {
      // "Explore" part of crescent
      activeKind: 'published' // 'example', 'uploaded' 
    },
    runs: {},
    vis: {
      pipeline: {
        activeStep: null,
        parameters: {
          singleCell: 'MTX',
          numberGenes: {min: 50, max: 8000},
          percentMito: {min: 0, max: 0.2},
          resolution: 1,
          principalDimensions: 10,
        },
      },
      results: {
        availableResults: [], // available plots: 'tsne', 'violin', etc.
        activeResult: null, 
        availableGroups: [], // ways to label the data (i.e. cluster)
        activeGroup: null,
        selectedFeature: null, // gene of interest
        // Gene of interest
        selectedFeature: null,
        // Data structures for Plotly
        scatterPlots: [], // to define
        violin: null,
      }
    }
  }
}

const setParameters = R.set(R.lensPath(['toggle', 'vis', 'pipeline', 'parameters']))

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
        R.set(
          R.lensPath(['toggle','projects','activeKind']),
          'uploaded',
        ),
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
        setSidebarView('pipeline'),
        setMainView('vis'),
        setRunFromGQL(run), 
      )(state)
    // App can either be selecting projects and selecting/inspecting runs
    // Inspecting a run requires sidebar to be showing
    case 'TOGGLE_LOGIN':
      return R.compose(
        setMainView('login')
      )(state)
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
    case 'TOGGLE_PROJECT_ACTIVE_KIND':
      const {projectKind} = payload
      const setActiveProjectKind = R.set(
        R.lensPath(['toggle','projects','activeKind']),
        projectKind
      )
      return setActiveProjectKind(state)
    case 'TOGGLE_PIPELINE_ACTIVE_STEP':
      const {step} = payload 
      const setActivePipelineStep = R.set(
        R.lensPath(['toggle','vis','pipeline','activeStep']),
        step,
      )
      return R.compose(
        setActivePipelineStep
      )(state)
    case 'TOGGLE_RESULT_ACTIVE_RESULT':
      const {result} = payload
      const setActiveResultToggle = R.set(
        R.lensPath(['toggle','vis','results','activeResult']),
        result
      )
      return setActiveResultToggle(state)

    // Local data
    case 'SET_PARAMETERS':
      const {parameters} = payload
      return R.compose(
        setParameters(parameters)
      )(state)
    
    // visualization stuff
    case 'SET_AVAILABLE_RESULTS':
      const {plots} = payload
      const setAvailableResults = R.set(
        R.lensPath(['toggle','vis', 'results', 'availableResults']),
        plots
      )
      return setAvailableResults(state)
    case 'SET_AVAILABLE_GROUPS':
      const {groups} = payload
      const setAvailableGroups = R.set(
        R.lensPath(['toggle','vis', 'results', 'availableGroups']),
        groups 
      )
      return setAvailableGroups(state)
    case 'SET_ACTIVE_GROUP':
      const {group} = payload
      const setActiveGroup = R.set(
        R.lensPath(['toggle','vis', 'results', 'activeGroup']),
        group
      )
      return setActiveGroup(state)
    
    default:
      return state
  }
}

// Combine all reducers for application
export default combineReducers({
  app
})