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

const goBack = ({comparePagePlots}) => ({
  type: 'context/goBack',
  payload: {
    comparePagePlots
  }
})

const goToCompare = R.always({
  type: 'context/goToCompare'
})

const goToResults = ({runID}) => ({
  type: 'context/goToResults',
  payload: {
    runID
  }
})

export {
  setUser,
  setProject,
  setRun,
  goHome,
  goBack,
  goToCompare,
  goToResults
}