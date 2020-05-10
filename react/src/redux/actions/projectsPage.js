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

const resetProjectsPage = R.always({type: 'projectsPage/reset'})

export {
  setActiveProjectKind,
  setSearchFilter,
  resetProjectsPage
}