import { Machine, assign } from 'xstate';

// State machine for violin plot and dot plot
export const initiallyIdleMachine = (initialState) =>  Machine({
    id: `initiallyIdleMachine`,
    initial: initialState,
    context: {
      plotData: [],
    },
    states: {
      idle: {
        on: {
          ADD_GENE: 'initialLoading',
        }
      },
      initialLoading: {
        on: {
          SUCCESS: {
            target: "complete",
            actions: 
              assign({
                plotData: (context, {data}) => data,
              })
          },
          COLLAPSE_SIDEBAR: 'multiPlotLoading',
        }
      },
      complete: {
        on:{
          CHANGE_PARAMETER: 'dataLoading',
          ADD_GENE: 'dataLoading',
          COLLAPSE_SIDEBAR: 'multiPlotLoading',
          CLEAR_GENES: 'idle',
        }
      },
      dataLoading: {
        on: {
          SUCCESS: {
            target: "complete",
            actions: 
            assign({
              plotData: (context, {data}) => data,
            })
          },
          CLEAR_GENES: 'idle',
          COLLAPSE_SIDEBAR: 'multiPlotLoading',
        }
      },
      multiPlotLoading: {
        on: {
          SUCCESS: {
            target: "multiPlotComplete",
            actions: 
              assign({
                plotData: (context, {data}) => data
              })
          },
          CLEAR_GENES: 'idle',
          COLLAPSE_SIDEBAR: 'dataLoading',
        }
      },
      multiPlotComplete:{
        on: {
          CHANGE_ACTIVE_PLOT: 'dataLoading',
          COLLAPSE_SIDEBAR: 'dataLoading',
        }
      }
    }
  })