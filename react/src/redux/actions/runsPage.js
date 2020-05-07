import * as R from 'ramda'

const setActiveRunsFilter = ({runsFilter}) => ({
  type: 'runsPage/setActiveRunsFilter',
  payload: {
    runsFilter
  }
})

const resetRunsPage = R.always({type: 'runsPage/reset'})

export {
  setActiveRunsFilter,
  resetRunsPage
}