import * as R from 'ramda'

const setActiveRunsFilter = ({runsFilter}) => ({
  type: 'runsPage/setActiveRunsFilter',
  payload: {
    runsFilter
  }
})

export {
  setActiveRunsFilter
}