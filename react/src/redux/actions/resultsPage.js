import * as R from 'ramda'

const setActiveSidebarTab = ({sidebarTab}) => ({
  type: 'resultsPage/setActiveSidebarTab',
  payload: {
    sidebarTab
  }
})

const setActivePipelineStep = ({pipelineStep}) => ({
  type: 'resultsPage/setActivePipelineStep',
  payload: {
    pipelineStep
  }
})

const setActiveResult = ({result}) => ({
  type: 'resultsPage/setActiveResult',
  payload: {
    result
  }
})

const setSelectedQC = ({value}) => ({
  type: 'resultsPage/setSelectedQC',
  payload: {
    value
  }
})

const setSelectedFeature = ({value}) => ({
  type: 'resultsPage/setSelectedFeature',
  payload: {
    value
  }
})

const setSelectedGroup = ({value}) => ({
  type: 'resultsPage/setSelectedGroup',
  payload: {
    value
  }
})

const setSelectedDiffExpression = ({value}) => ({
  type: 'resultsPage/setSelectedDiffExpression',
  payload: {
    value
  }
})


const resetResultsPage = R.always({type: 'resultsPage/reset'})

export {
  setActiveSidebarTab,
  setActivePipelineStep,
  setActiveResult,
  setSelectedQC,
  setSelectedFeature,
  setSelectedGroup,
  setSelectedDiffExpression,
  resetResultsPage
}