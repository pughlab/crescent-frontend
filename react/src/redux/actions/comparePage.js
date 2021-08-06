import * as R from 'ramda'

const resetComparePage = R.always({type: 'comparePage/reset'})

const cacheComparePage = ({plotQueryID, plotQueries}) => ({
  type: 'comparePage/cacheComparePage',
  payload: {
    plotQueryID, plotQueries
  }
})

export {
  resetComparePage,
  cacheComparePage,
}