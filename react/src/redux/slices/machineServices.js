import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  annotationsService: null,
  newProjectService: null
}

const machineServicesSlice = createSlice({
  name: 'machineServices',
  initialState,
  reducers: {
    setAnnotationsService: (state, action) => {
      const {service} = action.payload

      state.annotationsService = service
    },
    setNewProjectService: (state, action) => {
      const {service} = action.payload

      state.newProjectService = service
    }
  }
})

// Reducer
export default machineServicesSlice.reducer
// Actions
export const {
  setAnnotationsService,
  setNewProjectService
} = machineServicesSlice.actions