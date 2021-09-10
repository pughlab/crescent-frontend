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

export {
  resetComparePage,
  cacheComparePage,
  updatePlot
}