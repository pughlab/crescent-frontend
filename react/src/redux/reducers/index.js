import { combineReducers } from 'redux'

import context from './context'
import projectsPage from './projectsPage'
import runsPage from './runsPage'
import resultsPage from './resultsPage'

// Combine all reducers for application
export default combineReducers({
  context,
  projectsPage,
  runsPage,
  resultsPage,
})