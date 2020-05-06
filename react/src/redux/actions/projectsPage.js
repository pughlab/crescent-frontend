import * as R from 'ramda'

const setActiveProjectKind = ({projectKind}) => ({
  type: 'projectsPage/setActiveProjectKind',
  payload: {
    projectKind
  }
})

export {
  setActiveProjectKind
}