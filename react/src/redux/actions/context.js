import * as R from 'ramda'

const setUser = ({user}) => ({
  type: 'context/setUser',
  payload: {
    user
  }
})
const setProject = ({projectID}) => ({
  type: 'context/setProject',
  payload: {
    projectID
  }
})

const setRun = ({run}) => ({
  type: 'context/setRun',
  payload: {
    run
  }
})

const goHome = R.always({
  type: 'context/goHome'
})

const goBack = R.always({
  type: 'context/goBack'
})

export {
  setUser,
  setProject,
  setRun,
  goHome,
  goBack,
}