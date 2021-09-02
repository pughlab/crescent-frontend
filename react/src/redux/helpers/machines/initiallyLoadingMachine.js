import { Machine, assign } from 'xstate';

// State machine for tSNE and UMAP
export const initiallyLoadingMachine = (initialState) => Machine({
  id: 'initiallyLoadingMachine',
  initial: initialState,
  context: {
    plotData: [],
    isOpacityComplete: false,
  },
  states: {
    initialScatterLoading: {
      on: {
        SCATTER_SUCCESS: {
          target: "scatterComplete",
          actions: 
            assign({
              plotData: (context, { data}) => data,
              isOpacityComplete: false
            })
        },
      }
    },
    initialOpacityLoading: {
      on: {
        OPACITY_SUCCESS: {
          target: "opacityComplete",
          actions: 
            assign({
              plotData: (context, { data}) => data,
              isOpacityComplete: true
            })
        },
      }
    },
    scatterLoading: {
      on: {
        SCATTER_SUCCESS: {
          target: "scatterComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data,
              isOpacityComplete: false
            })
        },
      }
    },
    scatterComplete: {
      on:{
        CHANGE_PARAMETER: 'scatterLoading',
        ADD_GENE: 'opacityLoading',
        CHANGE_GROUP_TO_NUMERIC: "scatterLoading",
      }
    },
    opacityLoading: {
      on: {
        OPACITY_SUCCESS: {
          target: "opacityComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data,
              isOpacityComplete: true
            })
        },
      }
    },
    opacityComplete:{
      on: {
        CLEAR_GENES: "scatterLoading",
        ADD_GENE: 'opacityLoading',
        CHANGE_PARAMETER: "opacityLoading",
        CHANGE_GROUP_TO_NUMERIC: "scatterLoading",
        CHANGE_ASSAY: "opacityLoading"
      }
    }
  }
})