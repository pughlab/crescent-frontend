import * as R from 'ramda'

const resetComparePage = R.always({type: 'comparePage/reset'})

const cacheComparePage = ({plotQueryID, plotQueries}) => ({
  type: 'comparePage/cacheComparePage',
  payload: {
    plotQueryID, plotQueries
  }
})

const updatePlot = ({plotQuery}) => ({
  type: 'comparePage/updatePlot',
  payload: {
    plotQuery
  }
})

const addPlots = ({value}) => ({
  type: 'comparePage/addPlots',
  payload: {
    value
  }
})

const removePlots = ({value}) => ({
  type: 'comparePage/removePlots',
  payload: {
    value
  }
})

const clearPlots = R.always({
  type: 'comparePage/clearPlots',
})

export {
  resetComparePage,
  cacheComparePage,
  updatePlot,
  addPlots,
  removePlots,
  clearPlots
}