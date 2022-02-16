import { createSlice } from '@reduxjs/toolkit'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

const initialState = {
  error: null, // Store Apollo errors here to trigger the error modal
  isGuest: true,
  projectID: null,
  runID: null,
  userID: null,
  view: 'projects' // 'projects' || 'runs' || 'results'
}

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    goBack: (state, action) => {
      const {projectID: currentProjectID, view: currentView} = state
      const {comparePagePlots} = action.payload
      const view = R.prop(currentView, {
        'projects': 'projects',
        'runs': 'projects',
        'results': RA.isNilOrEmpty(comparePagePlots) ? 'runs' : 'compare',
        'compare': currentProjectID ? 'runs' : 'projects'
      })

      // Reset project ID if going back from runs page
      state.projectID = R.equals(currentView, 'runs') ? null : currentProjectID
      // Unselect run when going back
      state.runID = null
      state.view = view
    },
    goHome: state => {
      state.error = null
      state.projectID = null
      state.runID = null
      state.view = 'projects'
    },
    goToCompare: state => {
      state.view = 'compare'
    },
    goToResults: (state, action) => {
      const {runID} = action.payload

      state.runID = runID
      state.view = 'results'
    },
    setProject: (state, action) => {
      const {projectID} = action.payload

      state.projectID = projectID
      state.view = 'runs'
    },
    setRun: (state, action) => {
      const {runID} = action.payload

      state.runID = runID
      state.view = 'results'
    },
    setUser: (state, action) => {
      const {user} = action.payload
      const userID = R.prop('userID', user)
      // Check if the user is a guest by looking at the domain of their email
      const isGuest = R.compose(
        R.equals('crescent.cloud'),
        R.last,
        R.split('@'),
        R.prop('email')
      )(user)

      state.isGuest = isGuest
      state.projectID = null
      state.runID = null
      state.userID = userID
      state.view = 'projects'
    }
  }
})

// Reducer
export default contextSlice.reducer
// Actions
export const {
  goBack,
  goHome,
  goToCompare,
  goToResults,
  setProject,
  setRun,
  setUser
} = contextSlice.actions