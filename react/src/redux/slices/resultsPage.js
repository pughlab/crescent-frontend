import { createSlice } from '@reduxjs/toolkit'
import { interpret } from 'xstate'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import { cleanUpPlotQuery, getMachine, initiateService } from '../../utils'

const initialPlotQuery = {
  activeResult: null,
  plotQueryID: null,
  runID: null,
  selectedAssay: null,
  selectedDiffExpression: 'All',
  selectedExpRange: [0, 0],
  selectedFeature: null,
  selectedFeatures: [],
  selectedGroup: null,
  selectedInferCNVType: 'observations',
  selectedQC: 'Before_After_Filtering',
  selectedQCDataset: null,
  selectedScaleBy: "gene",
  service: null
}

const initialState = {
  activeAnnotationsAction: null, // 'runMetadata' || 'gsva' || 'infercnv'
  activeDataAction: null, // The currently active data action
  activePipelineStep: null, // The currently active pipeline step
  activePlot: 0,
  activeSidebarTab: 'parameters', // 'parameter' || 'visualizations'
  plotQueries: [],
  runStatus: null,
  sidebarCollapsed: false
}

const resultsPageSlice = createSlice({
  name: 'resultsPage',
  initialState,
  reducers: {
    addEmptyPlot: state => {
      const {plotQueries} = state
      
      if (RA.lengthLte(6, plotQueries)) {
        state.activePlot = R.length(plotQueries)
        state.plotQueries.push(initialPlotQuery)
      }
    },
    // For compare modal
    addPlots: (state, action) => {
      const {plotQueries} = state
      const {value} = action.payload

      state.plotQueries = R.concat(
        R.map(R.compose(initiateService, cleanUpPlotQuery), value),
        plotQueries
      )
    },
    // For plots
    addSelectedFeature: (state, action) => {
      const {send, value} = action.payload
      const {activePlot} = state

      send({type: 'ADD_GENE'})

      state.plotQueries[activePlot].selectedFeatures.push(value)
    },
    // For compare modal
    clearPlots: state => {
      state.plotQueries = []
    },
    initializePlots: (state, action) => {
      const {selectedPlotID, value} = action.payload
      const plots = R.map(R.compose(initiateService, cleanUpPlotQuery), value)
  
      if (R.any(R.propEq('plotQueryID', selectedPlotID), plots)) {
        state.activePlots = 0
      }

      state.plotQueries = R.isEmpty(value) ? [initialPlotQuery] : plots
      state.selectedPlotID = null
    },
    // For compare modal
    removePlots: (state, action) => {
      const {plotQueries} = state
      const {value} = action.payload

      state.plotQueries = R.reject(({plotQueryID}) => R.includes(plotQueryID, value), plotQueries)
    },
    // For plots
    removeSelectedFeature: (state, action) => {
      const {activePlot, plotQueries} = state
      const {send, value} = action.payload
      const selectedFeatures = plotQueries[activePlot].selectedFeatures

      send({type: RA.lengthLte(1, selectedFeatures) ? 'CLEAR_GENES' : 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedFeatures = R.without([value], selectedFeatures)
    },
    resetResultsPage: () => initialState,
    // For plots: send success event to the state machine
    sendSuccess: (_, action) => {
      const {data, send, type} = action.payload

      send({type: type || 'SUCCESS', data})
    },
    setActiveAnnotationsAction: (state, action) => {
      const {annotationsAction} = action.payload
      
      state.activeAnnotationsAction = annotationsAction
    },
    setActiveDataAction: (state, action) => {
      const {dataAction} = action.payload
      
      state.activeDataAction = dataAction
    },
    setActivePipelineStep: (state, action) => {
      const {pipelineStep} = action.payload
      
      state.activePipelineStep = pipelineStep
    },
    setActivePlot: (state, action) => {
      const {value} = action.payload
      
      state.activePlot = value
    },
    // For plots
    setActiveResult: (state, action) => {
      const {activePlot} = state
      const {result} = action.payload

      const renewService = () => {
        const currService = state.plotQueries[activePlot].service

        if (currService) currService.stop()

        return interpret(getMachine({...initialPlotQuery, activeResult: result})).start()
      }
      
      state.plotQueries[activePlot].activeResult = result
      state.plotQueries[activePlot].service = renewService()
    },
    setActiveSidebarTab: (state, action) => {
      const {sidebarTab} = action.payload
      
      state.activeSidebarTab = sidebarTab
    },
    // For plots
    setInferCNVType: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      send({type: 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedInferCNVType = value
    },
    setPlotQueryID: (state, action) => {
      const {activePlot} = state
      const {value} = action.payload

      state.plotQueries[activePlot].plotQueryID = value
    },
    setRunStatus: (state, action) => {
      const {status} = action.payload

      state.runStatus = status
    },
    // For plots
    setSelectedAssay: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      send({type: 'CHANGE_ASSAY'})

      state.plotQueries[activePlot].selectedAssay = value
    },
    // For plots
    setSelectedDiffExpression: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      send({type: 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedDiffExpression = value
      state.plotQueries[activePlot].selectedGroup = null
    },
    // For plots
    setSelectedExpRange: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      send({type: 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedExpRange = value
    },
    // For plots
    setSelectedFeature: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      send({type: value ? 'ADD_GENE' : 'CLEAR_GENES'})

      state.plotQueries[activePlot].selectedExpRange = [0, 0]
      state.plotQueries[activePlot].selectedFeature = value
    },
    // For plots
    setSelectedGroup: (state, action) => {
      const {activePlot} = state
      const {send, type, value} = action.payload

      send({type: type || 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedGroup = value
    },
    // For plots
    setSelectedQC: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload
      
      send({type: R.equals(value, 'Before_After_Filtering') ? 'SELECT_VIOLIN' : 'SELECT_UMAP'})

      state.plotQueries[activePlot].selectedQC = value
    },
    // For plots
    setSelectedQCDataset: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      if (send) send({type: 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedQCDataset = value
    },
    // For plots
    setSelectedScaleBy: (state, action) => {
      const {activePlot} = state
      const {send, value} = action.payload

      send({type: 'CHANGE_PARAMETER'})

      state.plotQueries[activePlot].selectedScaleBy = value
    },
    toggleSidebarCollapsed: state => {
      const {sidebarCollapsed} = state

      state.sidebarCollapsed = !sidebarCollapsed
    }
  }
})

// Reducer
export default resultsPageSlice.reducer
// Actions
export const {
  addEmptyPlot,
  addPlots,
  addSelectedFeature,
  clearPlots,
  initializePlots,
  removePlots,
  removeSelectedFeature,
  resetResultsPage,
  sendSuccess,
  setActiveAnnotationsAction,
  setActiveDataAction,
  setActivePipelineStep,
  setActivePlot,
  setActiveResult,
  setActiveSidebarTab,
  setInferCNVType,
  setPlotQueryID,
  setRunStatus,
  setSelectedAssay,
  setSelectedDiffExpression,
  setSelectedExpRange,
  setSelectedFeature,
  setSelectedGroup,
  setSelectedQC,
  setSelectedQCDataset,
  setSelectedScaleBy,
  toggleSidebarCollapsed
} = resultsPageSlice.actions