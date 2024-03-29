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

const setSelectedQC = ({value, send}) => ({
  type: 'resultsPage/setSelectedQC',
  payload: {
    value,
    send
  }
})

const setSelectedQCDataset = ({value, send}) => ({
  type: 'resultsPage/setSelectedQCDataset',
  payload: {
    value,
    send
  }
})

const setSelectedFeature = ({value, send}) => ({
  type: 'resultsPage/setSelectedFeature',
  payload: {
    value,
    send
  }
})

const addSelectedFeature = ({value, send}) => ({
  type: 'resultsPage/addSelectedFeature',
  payload: {
    value,
    send
  }
})

const removeSelectedFeature = ({value, send}) => ({
  type: 'resultsPage/removeSelectedFeature',
  payload: {
    value,
    send,
  }
})

const setSelectedScaleBy = ({value, send}) => ({
  type: 'resultsPage/setSelectedScaleBy',
  payload: {
    value,
    send
  }
})

const setSelectedExpRange = ({value, send}) => ({
  type: 'resultsPage/setSelectedExpRange',
  payload: {
    value,
    send
  }
})

const setSelectedGroup = ({value, send, type}) => ({
  type: 'resultsPage/setSelectedGroup',
  payload: {
    value,
    send,
    type
  }
})

const setSelectedAssay = ({value, send}) => ({
  type: 'resultsPage/setSelectedAssay',
  payload: {
    value, 
    send
  }
})

const setSelectedDiffExpression = ({value, send}) => ({
  type: 'resultsPage/setSelectedDiffExpression',
  payload: {
    value,
    send
  }
})

const setInferCNVType = ({value, send}) => ({
  type: 'resultsPage/setInferCNVType',
  payload: {
    value,
    send
  }
})

const sendSuccess = ({send, data, type}) => ({
  type: 'resultsPage/sendSuccess',
  payload: {
    send,
    data,
    type
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

const setRunStatus = ({status}) => ({
  type: 'resultsPage/setRunStatus',
  payload: {
    status
  }
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
  setInferCNVType,
  sendSuccess,
  resetResultsPage,
  addEmptyPlot,
  setActivePlot,
  toggleSidebarCollapsed,
  initializePlots,
  setPlotQueryID,
  addPlots,
  removePlots,
  clearPlots,
  setRunStatus
}