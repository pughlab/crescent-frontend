import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import context from './context'
import projectsPage from './projectsPage'
import runsPage from './runsPage'
import resultsPage from './resultsPage'


const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  context,
  projectsPage,
  runsPage,
  resultsPage,
})
export default createRootReducer