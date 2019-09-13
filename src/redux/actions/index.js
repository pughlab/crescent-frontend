
const setUser = ({user}) => ({
  type: 'SET_USER',
  payload: {
    user
  }
})

const setProject = ({project}) => ({
  type: 'SET_PROJECT',
  payload: {
    project
  }
})

const setRun = ({run}) => ({
  type: 'SET_RUN',
  payload: {
    run
  }
})


export default {
  setProject,
  setRun,
  setUser
}