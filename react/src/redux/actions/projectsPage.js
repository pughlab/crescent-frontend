import * as R from 'ramda'

const setActiveProjectKind = ({projectKind}) => ({
  type: 'projectsPage/setActiveProjectKind',
  payload: {
    projectKind
  }
})

const resetProjectsPage = R.always({type: 'projectsPage/reset'})

export {
  setActiveProjectKind,
  resetProjectsPage
}