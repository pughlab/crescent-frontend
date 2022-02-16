import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activeProjectKind: 'public', // 'public' || 'uploaded'
  oncotreeFilter: [],
  searchFilter: '',
  tissueFilter: {
    cancer: true,
    nonCancer: true
  }
}

const projectsPageSlice = createSlice({
  name: 'projectsPage',
  initialState,
  reducers: {
    resetProjectsPage: () => initialState,
    setActiveProjectKind: (state, action) => {
      const {projectKind} = action.payload

      state.activeProjectKind = projectKind
    },
    setOncotreeFilter: (state, action) => {
      const {codes} = action.payload
  
      state.oncotreeFilter = codes
    },
    setSearchFilter: (state, action) => {
      const {value} = action.payload

      state.searchFilter = value
    },
    setTissueFilter: (state, action) => {
      const {cancer, nonCancer} = action.payload

      state.tissueFilter = {cancer, nonCancer}
    }
  }
})

// Reducer
export default projectsPageSlice.reducer
// Actions
export const {
  resetProjectsPage,
  setActiveProjectKind,
  setOncotreeFilter,
  setSearchFilter,
  setTissueFilter
} = projectsPageSlice.actions