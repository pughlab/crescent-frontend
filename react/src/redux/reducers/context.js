
import * as R from 'ramda'
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
        projectID: R.always(null),
        runID: R.always(null),
        view: R.always('projects')
      })(state)
    },
    'context/goHome': (state, payload) => {
      console.log('gohome', state)
      return R.evolve({
        projectID: R.always(null),
        runID: R.always(null),
        view: R.always('projects')
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
      const runID = R.always(null)
      // Reset project if going back from runs page
      const projectID = R.equals(currentView, 'runs') ? R.always(null) : R.identity
      return R.evolve({
        projectID,
        runID,
        view,
      })(state)
    }
  }
)