import reduxThunks from './thunks'

const setUser = ({user}) => ({
  type: 'SET_USER',
  payload: {
    user
  }
})

const setGuestUser = ({user}) => ({
  type: 'SET_GUEST_USER',
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

// If null then don't change activeKind
const toggleProjects = ({kind = null}) => ({
  type: 'TOGGLE_PROJECTS',
  payload: {
    kind
  }
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

const setIsSubmitted = ({isSubmitted}) => ({
  type: 'SET_IS_SUBMITTED',
  payload: {
    isSubmitted
  }
})

// TOGGLES
// rendering as well
const setActiveProjectKind = ({projectKind}) => ({
  type: 'TOGGLE_PROJECT_ACTIVE_KIND',
  payload: {
    projectKind
  }
})
const setActivePipelineStep = ({step}) => ({
  type: 'TOGGLE_PIPELINE_ACTIVE_STEP',
  payload: {
    step
  }
})
const setActiveResult = ({result}) => ({
  type: 'TOGGLE_RESULT_ACTIVE_RESULT',
  payload: {
    result
  }
})

const setActiveGroup = ({group}) => ({
  type: 'SET_ACTIVE_GROUP',
  payload: {
    group
  }
})

const setSelectedQC =  ({value}) => ({
  type: 'SET_SELECTED_QC',
  payload: {
    value
  }
})

const toggle = {
  project: {setActiveProjectKind},
  runs: {},
  vis: {
    dataset: {},
    pipeline: {
      setActivePipelineStep,
      setIsSubmitted
    },
    results: {
      setActiveResult,
      setActiveGroup,
      setSelectedQC
    }
  }
}

export default {
  setProject,
  setRun,
  setUser,
  setGuestUser,
  toggleProjects,
  toggleRuns,
  toggleSidebar,
  setParameters,

  toggle,
  thunks: reduxThunks
}