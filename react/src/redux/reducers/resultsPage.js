import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import createReducer from './createReducer'

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
}

const initialState = {
  activeSidebarTab: 'parameters', // visualizations

  activeDataAction: null, //inputs data actions in sidebar
  activePipelineStep: null, // pipeline parameters select in sidebar
  activeAnnotationsAction: null, // annotations actions in sidebar

  sidebarCollapsed: false,
  activePlot: 0,
  plotQueries: [
    initialPlotQuery
    // {
    //   activeResult: null, //results select in side
    //   selectedQC: 'Before_After_Filtering',
    //   selectedFeature: null,
    //   selectedGroup: null,
    //   selectedDiffExpression: 'All',
    //   selectedQCDataset: null,
    // }
  ]


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
      return R.evolve({
        // activeResult: R.always(result)
        plotQueries: evolveAtIndex({activeResult: R.always(result)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedQC': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedQC: R.always(value)
        plotQueries: evolveAtIndex({selectedQC: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedQCDataset': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedQCDataset: R.always(value)
        plotQueries: evolveAtIndex({selectedQCDataset: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedGroup': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedGroup: R.always(value)
        plotQueries: evolveAtIndex({selectedGroup: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedAssay': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedGroup: R.always(value)
        plotQueries: evolveAtIndex({selectedAssay: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedFeature': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedFeature: R.always(value)
        plotQueries: evolveAtIndex({selectedFeature: R.always(value), selectedExpRange: R.always([0, 0])}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/addSelectedFeature': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedFeature: R.always(value)
        plotQueries: evolveAtIndex({selectedFeatures: R.append(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/removeSelectedFeature': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedFeature: R.always(value)
        plotQueries: evolveAtIndex({selectedFeatures: R.without([value])}, activePlot)
      })(state)
    },
    // for plot
     'resultsPage/setSelectedScaleBy': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        plotQueries: evolveAtIndex({selectedScaleBy: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedExpRange': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        plotQueries: evolveAtIndex({selectedExpRange: R.always(value)}, activePlot)
      })(state)
    },
    // for plot
    'resultsPage/setSelectedDiffExpression': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
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

    'resultsPage/addPlot': (state, payload) => {
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
  }
)