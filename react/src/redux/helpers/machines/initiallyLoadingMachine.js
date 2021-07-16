import { Machine, assign } from 'xstate';

// State machine for tSNE and UMAP
export const initiallyLoadingMachine = Machine({
  id: 'initiallyLoadingMachine',
  initial: 'initialLoading',
  context: {
    plotData: [],
    isOpacityComplete: false,
  },
  states: {
    initialLoading: {
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
        CHANGE_PARAMETER: "opacityLoading"        
      }
    }
  }
})