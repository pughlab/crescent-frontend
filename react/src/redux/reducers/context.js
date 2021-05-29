
import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import createReducer from './createReducer'

const initialState = {
  keycloakUser: null,

  userID: null,

  projectID: null,
  runID: null,
  view: 'projects', // 'runs' || 'results'

  // Put any apollo error here to trigger modal
  error: null
}

export default createReducer(
  initialState, {
    'context/setKeycloakUser': (state, payload) => {
      const {keycloakUser} = payload
      return {...state, keycloakUser}
    },

    'context/setUser': (state, payload) => {
      const {user} = payload
      const userID = R.compose(R.always, R.prop('userID'))(user)
      // Check if guest by looking at email url
      const isGuest = R.compose(
        R.always,
        R.equals('crescent.cloud'), R.last, R.split('@'),
        R.prop('email')
      )(user)
      return R.evolve({
        userID,
        isGuest,
        projectID: R_.alwaysNull,
        runID: R_.alwaysNull,
        view: R.always('projects')
      })(state)
    },

    'context/setProject': (state, payload) => {
      const {projectID} = payload
      return R.evolve({
        projectID: R.always(projectID),
        view: R.always('runs')
      })(state)
    },

    'context/setRun': (state, payload) => {
      const {runID} = payload
      return R.evolve({
        runID: R.always(runID),
        view: R.always('results')
      })(state)
    },


    'context/goHome': (state, payload) => {
      console.log('gohome', state)
      return R.evolve({
        projectID: R_.alwaysNull,
        runID: R_.alwaysNull,
        view: R.always('projects'),
        error: R_.alwaysNull
      })(state)
    },
    
    'context/goBack': (state, payload) => {
      const {view: currentView} = state
      const view = R.compose(
        R.always,
        R.prop(R.__, {
          'projects': 'projects',
          'runs': 'projects',
          'results': 'runs'
        })
      )(currentView)
      // Going back will always unselect run
      const runID = R_.alwaysNull
      // Reset project if going back from runs page
      const projectID = R.equals(currentView, 'runs') ? R_.alwaysNull : R.identity
      return R.evolve({
        projectID,
        runID,
        view,
      })(state)
    }
  }
)