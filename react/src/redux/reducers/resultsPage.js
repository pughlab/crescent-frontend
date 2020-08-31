import * as R from 'ramda'
import * as R_ from 'ramda-extension'
import createReducer from './createReducer'

const initialPlotQuery = {
  activeResult: null,
  selectedQC: 'Before_After_Filtering',
  selectedFeature: null,
  selectedGroup: null,
  selectedDiffExpression: 'All',
  selectedQCDataset: null,
}

const initialState = {
  activeSidebarTab: 'parameters', // visualizations
  activePipelineStep: null,
  // activeResult: null,
  // selectedQC: 'Before_After_Filtering',
  // selectedFeature: null,
  // selectedGroup: null,
  // selectedDiffExpression: 'All',
  // selectedQCDataset: null,

  activePlot: 0,
  plotQueries: [
    initialPlotQuery
    // {
    //   activeResult: null,
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
    'resultsPage/setSelectedFeature': (state, payload) => {
      const {value} = payload
      const {activePlot} = state
      return R.evolve({
        // selectedFeature: R.always(value)
        plotQueries: evolveAtIndex({selectedFeature: R.always(value)}, activePlot)
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


    'resultsPage/reset': R.always(initialState),
  }
)