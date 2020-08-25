import * as R from 'ramda'

import oncotreeFilter from '../helpers/filters/oncotreeFilter'
import searchFilter from '../helpers/filters/searchFilter'
import tissueFilter from '../helpers/filters/tissueFilter'

const setActiveProjectKind = ({projectKind}) => ({
  type: 'projectsPage/setActiveProjectKind',
  payload: {
    projectKind
  }
})

const setSearchFilter = searchFilter.setSearchFilter.action('projectsPage')

const setTissueFilter = tissueFilter.setTissueFilter.action('projectsPage')

const resetProjectsPage = R.always({type: 'projectsPage/reset'})

const setOncotreeFilter = oncotreeFilter.setOncotreeFilter.action('projectsPage')

export {
  setActiveProjectKind,    
  setSearchFilter,
  setTissueFilter,
  setOncotreeFilter,
  resetProjectsPage
}