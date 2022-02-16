import { combineReducers } from '@reduxjs/toolkit'
import comparePageReducer from './slices/comparePage'
import contextReducer from './slices/context'
import machineServicesReducer from './slices/machineServices'
import projectArchiveReducer from './slices/projectArchive'
import projectsPageReducer from './slices/projectsPage'
import resultsPageReducer from './slices/resultsPage'
import runsPageReducer from './slices/runsPage'

const rootReducer = combineReducers({
  comparePage: comparePageReducer,
  context: contextReducer,
  machineServices: machineServicesReducer,
  projectArchive: projectArchiveReducer,
  projectsPage: projectsPageReducer,
  resultsPage: resultsPageReducer,
  runsPage: runsPageReducer
})

export default rootReducer