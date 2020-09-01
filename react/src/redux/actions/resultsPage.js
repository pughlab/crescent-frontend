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

const setSelectedQCDataset = ({value}) => ({
  type: 'resultsPage/setSelectedQCDataset',
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

const addPlot = () => ({
  type: 'resultsPage/addPlot',
  payload: {}
})

const setActivePlot = ({value}) => ({
  type: 'resultsPage/setActivePlot',
  payload: {value}
})

const toggleSidebarCollapsed = () => ({
  type: 'resultsPage/toggleSidebarCollapsed',
  payload: {}
})

const resetResultsPage = R.always({type: 'resultsPage/reset'})

export {
  setActiveSidebarTab,
  setActivePipelineStep,
  setActiveResult,
  setSelectedQC,
  setSelectedQCDataset,
  setSelectedFeature,
  setSelectedGroup,
  setSelectedDiffExpression,
  resetResultsPage,
  addPlot,
  setActivePlot,
  toggleSidebarCollapsed
}