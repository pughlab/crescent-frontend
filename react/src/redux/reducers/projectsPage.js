import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  activeProjectKind: 'public', // 'uploaded' 
  searchFilter: '',
  tissueFilter: {
    cancer: true,
    nonCancer: true
  },
  oncotreeFilter: []
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

    'projectsPage/setTissueFilter': (state, payload) => {
      const {cancer, nonCancer} = payload
      return R.evolve({
        tissueFilter: R.always({cancer, nonCancer})
      })(state)
    },

    'projectsPage/setOncotreeFilter': (state, payload) => {
      const {codes} = payload
      return R.evolve({
        oncotreeFilter: R.always(codes)
      })(state)
    },

    'projectsPage/reset': R.always(initialState),
  }
)