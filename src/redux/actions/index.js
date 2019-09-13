const logout = () => ({
  type: 'LOGOUT'
})

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

const toggleProjects = () => ({
  type: 'TOGGLE_PROJECTS'
})
const toggleRuns = () => ({
  type: 'TOGGLE_RUNS'
})

const toggleSidebar = ({sidebar}) => ({
  type: 'TOGGLE_SIDEBAR',
  payload: {
    sidebar
  }
})

const setParameters = ({parameters}) => ({
  type: 'SET_PARAMETERS',
  payload: {
    parameters
  }
})

export default {
  logout,
  setProject,
  setRun,
  setUser,
  toggleProjects,
  toggleRuns,
  toggleSidebar,
  setParameters
}