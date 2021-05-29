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

const setRun = ({runID}) => ({
  type: 'context/setRun',
  payload: {
    runID
  }
})

const goHome = R.always({
  type: 'context/goHome'
})

const goBack = R.always({
  type: 'context/goBack'
})

const setKeycloakUser = ({keycloakUser}) => ({
  type: 'context/setKeycloakUser',
  payload: {
    keycloakUser
  }
})

export {
  setUser,
  setProject,
  setRun,
  goHome,
  goBack,

  setKeycloakUser
}