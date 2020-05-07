import * as R from 'ramda'

const setUser = ({user}) => ({
  type: 'context/setUser',
  payload: {
    user
  }
})
const setProject = ({project}) => ({
  type: 'context/setProject',
  payload: {
    project
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