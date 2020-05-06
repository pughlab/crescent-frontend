import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeProjectKind: 'public' // 'uploaded' 
}

export default createReducer(
  initialState, {
    'projectsPage/setActiveProjectKind': (state, payload) => {
      const {projectKind} = payload
      return R.evolve({
        activeProjectKind: R.always(projectKind)
      })(state)
    }
  }
)