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

const setSelectedQC = ({QC}) => ({
  type: 'resultsPage/setSelectedQC',
  payload: {
    QC
  }
})

const resetResultsPage = R.always({type: 'resultsPage/reset'})

export {
  setActiveSidebarTab,
  setActivePipelineStep,
  setActiveResult,
  setSelectedQC,
  resetResultsPage
}