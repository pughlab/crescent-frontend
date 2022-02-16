import { createSlice } from '@reduxjs/toolkit'
import * as R from 'ramda'
import { cleanUpPlotQuery, initiateService } from '../../utils'

const initialState = {
  plotQueries: [],
  selectedPlotID: null
}

const comparePageSlice = createSlice({
  name: 'comparePage',
  initialState,
  reducers: {
    addPlots: (state, action) => {
      const {plotQueries} = state
      const {value} = action.payload

      state.plotQueries = R.concat(
        R.map(R.compose(initiateService, cleanUpPlotQuery), value),
        plotQueries
      )
    },
    cacheComparePage: (state, action) => {
      const {plotQueries: comparePagePlots} = state
      const {plotQueries: resultsPagePlots, plotQueryID} = action.payload

      state.plotQueries = R.isNil(resultsPagePlots) ? comparePagePlots : resultsPagePlots
      state.selectedPlotID = plotQueryID
    },
    clearPlots: state => {
      state.plotQueries = []
    },
    removePlots: (state, action) => {
      const {plotQueries} = state
      const {value} = action.payload

      state.plotQueries = R.reject(({plotQueryID}) => R.includes(plotQueryID, value), plotQueries)
    },
    resetComparePage: () => initialState,
    updatePlot: (state, action) => {
      const {plotQueries: comparePagePlots, plotQueryID} = state
      const {plotQuery} = action.payload
      const plotQueryIDEquals = R.propEq('plotQueryID', plotQueryID)
      const plotToUpdateIndex = R.findIndex(plotQueryIDEquals)(comparePagePlots)

      state.plotQueries[plotToUpdateIndex] = R.merge(comparePagePlots[plotToUpdateIndex], plotQuery)
    }
  }
})

// Reducers
export default comparePageSlice.reducer
// Actions
export const {
  addPlots,
  cacheComparePage,
  clearPlots,
  removePlots,
  resetComparePage,
  updatePlot
} = comparePageSlice.actions