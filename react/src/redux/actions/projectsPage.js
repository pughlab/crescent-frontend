import * as R from 'ramda'

const setActiveProjectKind = ({projectKind}) => ({
  type: 'projectsPage/setActiveProjectKind',
  payload: {
    projectKind
  }
})

const setSearchFilter = ({value}) => ({
  type: 'projectsPage/setSearchFilter',
  payload: {
    value
  }
})

const setTissueFilter = ({cancer, nonCancer}) => ({
  type: 'projectsPage/setTissueFilter',
  payload: {
    cancer, nonCancer
  }
})

const setOncotreeFilter = ({codes}) => ({
  type: 'projectsPage/setOncotreeFilter',
  payload: {
    codes
  }
})

const resetProjectsPage = R.always({type: 'projectsPage/reset'})

export {
  setActiveProjectKind,
  setSearchFilter,
  setTissueFilter,
  setOncotreeFilter,
  resetProjectsPage
}