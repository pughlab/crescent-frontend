
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

const toggleSidebar = ({sidebar}) => ({
  type: 'TOGGLE_SIDEBAR',
  payload: {
    sidebar
  }
})

export default {
  setProject,
  setRun,
  setUser,
  toggleProjects,
  toggleSidebar
}