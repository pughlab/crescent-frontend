import { Machine, assign } from 'xstate';

// For QC
export const QCMachine = (initialState) => Machine({
  id: 'QCMachine',
  initial: initialState,
  context: {
    plotData: [],
  },
  states: {
    initialViolinLoading: {
      on: {
        VIOLIN_SUCCESS: {
          target: "violinComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data,
            })
        },
      }
    },
    initialUmapLoading: {
      on: {
        UMAP_SUCCESS: {
          target: "umapComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data,
            })
        },
      }
    },
    violinLoading: {
      on: {
        VIOLIN_SUCCESS: {
          target: "violinComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data,
            })
        },
      }
    },
     violinComplete: {
      on:{
        SELECT_VIOLIN: 'violinLoading',
        SELECT_UMAP: "umapLoading",
        CHANGE_PARAMETER: 'violinLoading'  
      }
    },
    umapLoading: {
      on: {
        UMAP_SUCCESS: {
          target: "umapComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data,
            })
        },
      }
    },
    umapComplete:{
      on: {
        SELECT_VIOLIN: 'violinLoading',
        SELECT_UMAP: "umapLoading",
        CHANGE_PARAMETER: 'umapLoading'      
      }
    },
    umapLoading: {
      on: {
        UMAP_SUCCESS: {
          target: "umapComplete",
          actions: 
            assign({
              plotData: (context, {data}) => data
            })
        },
      }
    },
  }
})