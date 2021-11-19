import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import createReducer from './createReducer'
import { cleanUpPlotQuery, getMachine, initiateService } from '../../utils'

import { interpret } from 'xstate';

const initialPlotQuery = {
  activeResult: null,
  selectedQC: 'Before_After_Filtering',
  selectedFeature: null,
  selectedFeatures: [],
  selectedScaleBy: "gene",
  selectedExpRange: [0, 0],
  selectedGroup: null,
  selectedAssay: null,
  selectedDiffExpression: 'All',
  selectedQCDataset: null,
  service: null,
  plotQueryID: null,
  runID: null
}

const initialState = {
  activeSidebarTab: 'parameters', // visualizations

  activeDataAction: null, //inputs data actions in sidebar
  activePipelineStep: null, // pipeline parameters select in sidebar
  activeAnnotationsAction: null, // annotations actions in sidebar

  sidebarCollapsed: false,
  activePlot: 0,
  plotQueries: [
    // {
    //   activeResult: null, //results select in side
    //   selectedQC: 'Before_After_Filtering',
    //   selectedFeature: null,
    //   selectedGroup: null,
    //   selectedDiffExpression: 'All',
    //   selectedQCDataset: null,
    // }
  ],
  runStatus: null
}

const evolveAtIndex = (transformations, index) => R.over(R.lensIndex(index), R.evolve(transformations))

export default createReducer(
  initialState, {
    'resultsPage/setActiveSidebarTab': (state, payload) => {
      const {sidebarTab} = payload
      return R.evolve({
        activeSidebarTab: R.always(sidebarTab)
      })(state)
    },

    'resultsPage/setActiveDataAction': (state, payload) => {
      const {dataAction} = payload
      return R.evolve({
        activeDataAction: R.always(dataAction)
      })(state)
    },

    'resultsPage/setActiveAnnotationsAction': (state, payload) => {
      const {annotationsAction} = payload
      return R.evolve({
        activeAnnotationsAction: R.always(annotationsAction)
      })(state)
    },

    'resultsPage/setActivePipelineStep': (state, payload) => {
      const {pipelineStep} = payload
      return R.evolve({
        activePipelineStep: R.always(pipelineStep)
      })(state)
    },
    
    // for plot
    'resultsPage/setActiveResult': (state, payload) => {
      const {result} = payload
      const {activePlot} = state
      const renewService = () => {
        const currService = state.plotQueries[activePlot].service
        if(currService) currService.stop()
        return interpret(getMachine({...initialPlotQuery, activeResult: result})).start()
      }
      return R.evolve({
        // activeResult: R.always(result)
        plotQueries: evolveAtIndex({
          activeResult: R.always(result), 
          service: renewService
        }, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedQC': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: R.equals(value, 'Before_After_Filtering') ? 'SELECT_VIOLIN' : 'SELECT_UMAP'})
      return R.evolve({
        // selectedQC: R.always(value)
        plotQueries: evolveAtIndex({selectedQC: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedQCDataset': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      if (send) send({type: 'CHANGE_PARAMETER'})
      return R.evolve({
        // selectedQCDataset: R.always(value)
        plotQueries: evolveAtIndex({selectedQCDataset: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedGroup': (state, payload) => {
      const {value, send, type} = payload
      const {activePlot} = state
      send({type: type || 'CHANGE_PARAMETER'})
      return R.evolve({
        // selectedGroup: R.always(value)
        plotQueries: evolveAtIndex({selectedGroup: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedAssay': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: 'CHANGE_ASSAY'})
      return R.evolve({
        // selectedGroup: R.always(value)
        plotQueries: evolveAtIndex({selectedAssay: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedFeature': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: value ? 'ADD_GENE' : 'CLEAR_GENES'})
      return R.evolve({
        // selectedFeature: R.always(value)
        plotQueries: evolveAtIndex({selectedFeature: R.always(value), selectedExpRange: R.always([0, 0])}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/addSelectedFeature': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: 'ADD_GENE'})
      return R.evolve({
        plotQueries: evolveAtIndex({selectedFeatures: R.append(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/removeSelectedFeature': (state, payload) => {
      const {value, send} = payload
      const {activePlot, plotQueries} = state      
      send({type: R.length(plotQueries[activePlot].selectedFeatures) <= 1 ? 'CLEAR_GENES' : 'CHANGE_PARAMETER'})
      return R.evolve({
        plotQueries: evolveAtIndex({selectedFeatures: R.without([value])}, activePlot)
      })(state)
    },
    // for plot
     'resultsPage/setSelectedScaleBy': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: 'CHANGE_PARAMETER'})
      return R.evolve({
        plotQueries: evolveAtIndex({selectedScaleBy: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedExpRange': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: 'CHANGE_PARAMETER'})
      return R.evolve({
        plotQueries: evolveAtIndex({selectedExpRange: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedDiffExpression': (state, payload) => {
      const {value, send} = payload
      const {activePlot} = state
      send({type: 'CHANGE_PARAMETER'})
      return R.evolve({
        plotQueries: evolveAtIndex(
          {
            selectedDiffExpression: R.always(value),
            selectedGroup: R_.alwaysNull
          },
          activePlot
        )
      })(state)
    },
    // for plot: send success event to the state machine
    'resultsPage/sendSuccess': (state, payload) => {
      const {send, data, type} = payload
      send({type: type || 'SUCCESS', data})
      return state
    },

    'resultsPage/addEmptyPlot': (state, payload) => {
      const {plotQueries} = state
      const addAndSetActivePlot =         R.evolve({
        activePlot: R.always(R.length(plotQueries)),
        plotQueries: R.append(initialPlotQuery)
      })
      return R.ifElse(
        R.propSatisfies(R.compose(R.lt(6), R.length), 'plotQueries'),
        R.identity,
        addAndSetActivePlot
      )(state)
    },

    'resultsPage/setActivePlot': (state, payload) => {
      const {value} = payload
      return R.evolve({
        activePlot: R.always(value)
      })(state)
    },

    'resultsPage/toggleSidebarCollapsed': (state, payload) => {
      return R.evolve({
        sidebarCollapsed: R.not
      })(state)
    },


    'resultsPage/reset': R.always(initialState),

    // add saved plots and set active plot
    'resultsPage/initializePlots': (state, payload) => {
      const {value, selectedPlotID} = payload
      const plots = R.map(R.compose(initiateService, cleanUpPlotQuery), value)
      return R.evolve({
        activePlot: R.always(
          R.ifElse(
            R.equals(-1),
            R.always(0),
            R.identity
          )(R.findIndex(R.propEq('plotQueryID', selectedPlotID))(plots))
        ),
        selectedPlotID: R.always(null),
        plotQueries: R.always(R.isEmpty(value) ? [initialPlotQuery] : plots),
      })(state)
    },

    'resultsPage/setPlotQueryID': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        plotQueries: evolveAtIndex({plotQueryID: R.always(value)}, activePlot)
      })(state)
    },

    // for compare modal
    'resultsPage/addPlots': (state, payload) => {
      const {value} = payload
      return R.evolve({
        plotQueries: R.concat(R.map(R.compose(initiateService, cleanUpPlotQuery), value))
      })(state)
    },

    // for compare modal
    'resultsPage/removePlots': (state, payload) => {
      const {value} = payload
      return R.evolve({
        plotQueries: R.filter(({plotQueryID}) => !R.includes(plotQueryID, value))
      })(state)
    },

    // for compare modal
    'resultsPage/clearPlots': (state, payload) => {
      return R.evolve({
        plotQueries: R.always([])
      })(state)
    },

    'resultsPage/setRunStatus': (state, payload) => {
      const {status} = payload

      return R.evolve({
        runStatus: R.always(status)
      })(state)
    }
  }
)