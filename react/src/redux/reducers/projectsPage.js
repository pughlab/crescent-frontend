import * as R from 'ramda'
import createReducer from './createReducer'

import oncotreeFilter from '../helpers/filters/oncotreeFilter'
import searchFilter from '../helpers/filters/searchFilter'
import tissueFilter from '../helpers/filters/tissueFilter'

const initialState = {
  activeProjectKind: 'public', // 'uploaded' 

  ... tissueFilter.initialState,
  ... searchFilter.initialState,
  ... oncotreeFilter.initialState
}

export default createReducer(
  initialState, {
    'projectsPage/setActiveProjectKind': (state, payload) => {
      const {projectKind} = payload
      return R.evolve({
        activeProjectKind: R.always(projectKind)
      })(state)
    },

    'projectsPage/setSearchFilter': searchFilter.setSearchFilter.reducer,    

    'projectsPage/setTissueFilter': tissueFilter.setTissueFilter.reducer,

    'projectsPage/setOncotreeFilter': oncotreeFilter.setOncotreeFilter.reducer,

    'projectsPage/reset': R.always(initialState),
  }
)