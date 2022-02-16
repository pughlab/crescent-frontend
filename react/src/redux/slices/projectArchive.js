import { createSlice } from '@reduxjs/toolkit'
import * as R from 'ramda'

const initialState = {
  accordionIndices: [],
  confirmArchiveProjectOpen: false,
  confirmArchiveRunsOpen: false,
  projectArchiveModalOpen: false,
  selectedRuns: []
}

const projectArchiveSlice = createSlice({
  name: 'projectArchive',
  initialState,
  reducers: {
    resetAccordionIndices: state => {
      state.accordionIndices = []
    },
    resetProjectArchive: () => initialState,
    setConfirmArchiveProjectOpen: (state, action) => {
      const {open} = action.payload

      state.confirmArchiveProjectOpen = open
    },
    setConfirmArchiveRunsOpen: (state, action) => {
      const {open} = action.payload

      state.confirmArchiveRunsOpen = open
    },
    setProjectArchiveModalOpen: (state, action) => {
      const {open} = action.payload

      state.projectArchiveModalOpen = open
    },
    setRunSelected: (state, action) => {
      const {selectedRuns} = state
      const {runID} = action.payload

      state.selectedRuns = R.ifElse(
        R.includes(runID),
        R.without([runID]),
        R.append(runID)
      )(selectedRuns)
    },
    toggleAccordionIndices: (state, action) => {
      const {accordionIndices} = state
      const {index} = action.payload

      state.accordionIndices = R.ifElse(
        R.includes(index),
        R.without([index]),
        R.append(index)
      )(accordionIndices)
    }
  }
})

// Reducer
export default projectArchiveSlice.reducer
// Actions
export const {
  resetAccordionIndices,
  resetProjectArchive,
  setConfirmArchiveProjectOpen,
  setConfirmArchiveRunsOpen,
  setProjectArchiveModalOpen,
  setRunSelected,
  toggleAccordionIndices
} = projectArchiveSlice.actions