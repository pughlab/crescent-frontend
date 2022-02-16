import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeRunsFilter: 'all' // 'all' || 'pending' || 'submitted' || 'completed' || 'failed'
}

const runsPageSlice = createSlice({
  name: 'runsPage',
  initialState,
  reducers: {
    resetRunsPage: () => initialState,
    setActiveRunsFilter: (state, action) => {
      const {runsFilter} = action.payload

      state.activeRunsFilter = runsFilter
    }
  }
})

// Reducer
export default runsPageSlice.reducer
// Actions
export const {
  resetRunsPage,
  setActiveRunsFilter
} = runsPageSlice.actions