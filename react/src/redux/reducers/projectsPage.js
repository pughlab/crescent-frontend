import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeProjectKind: 'public', // 'uploaded' 
  searchFilter: ''
}

export default createReducer(
  initialState, {
    'projectsPage/setActiveProjectKind': (state, payload) => {
      const {projectKind} = payload
      return R.evolve({
        activeProjectKind: R.always(projectKind)
      })(state)
    },

    'projectsPage/setSearchFilter': (state, payload) => {
      const {value} = payload
      return R.evolve({
        searchFilter: R.always(value)
      })(state)
    },

    'projectsPage/reset': R.always(initialState),
  }
)