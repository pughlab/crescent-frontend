import * as R from 'ramda'

const setActiveSidebarTab = ({sidebarTab}) => ({
  type: 'resultsPage/setActiveSidebarTab',
  payload: {
    sidebarTab
  }
})

const setActiveDataAction = ({dataAction}) => ({
  type: 'resultsPage/setActiveDataAction',
  payload: {dataAction}
})

const setActiveAnnotationsAction = ({annotationsAction}) => ({
  type: 'resultsPage/setActiveAnnotationsAction',
  payload: {annotationsAction}
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

const addSelectedFeature = ({value}) => ({
  type: 'resultsPage/addSelectedFeature',
  payload: {
    value
  }
})

const removeSelectedFeature = ({value}) => ({
  type: 'resultsPage/removeSelectedFeature',
  payload: {
    value
  }
})

const setSelectedScaleBy = ({value}) => ({
  type: 'resultsPage/setSelectedScaleBy',
  payload: {
    value
  }
})

const setSelectedExpRange = ({value}) => ({
  type: 'resultsPage/setSelectedExpRange',
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

const setSelectedAssay = ({value}) => ({
  type: 'resultsPage/setSelectedAssay',
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

const addEmptyPlot = () => ({
  type: 'resultsPage/addEmptyPlot',
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

const initializePlots = ({value, selectedPlotID}) =>({
  type: 'resultsPage/initializePlots',
  payload: {
    value,
    selectedPlotID
  }
})

const setPlotQueryID = ({value}) => ({
  type: 'resultsPage/setPlotQueryID',
  payload: {value}
})

const addPlots = ({value}) => ({
  type: 'resultsPage/addPlots',
  payload: {
    value
  }
})

const removePlots = ({value}) => ({
  type: 'resultsPage/removePlots',
  payload: {
    value
  }
})

const clearPlots = R.always({
  type: 'resultsPage/clearPlots',
})


export {
  setActiveSidebarTab,
  setActiveDataAction,
  setActiveAnnotationsAction,
  setActivePipelineStep,
  setActiveResult,
  setSelectedQC,
  setSelectedQCDataset,
  setSelectedFeature,
  addSelectedFeature,
  removeSelectedFeature,
  setSelectedScaleBy,
  setSelectedExpRange,
  setSelectedGroup,
  setSelectedAssay,
  setSelectedDiffExpression,
  resetResultsPage,
  addEmptyPlot,
  setActivePlot,
  toggleSidebarCollapsed,
  initializePlots,
  setPlotQueryID,
  addPlots,
  removePlots,
  clearPlots,
}