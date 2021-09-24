import * as R from 'ramda'
import { cleanUpPlotQuery, initiateService } from '../../utils'
import createReducer from './createReducer'

const initialState = {
  selectedPlotID: null,
  plotQueries: []
}

export default createReducer(
  initialState, {
    'comparePage/reset': R.always(initialState),

    // save selected plotID and plot queries so we can return to compare page
    'comparePage/cacheComparePage': (state, payload) => {
      const {plotQueries: comparePagePlots} = state
      const {plotQueryID, plotQueries: resultsPagePlots} = payload
      return R.evolve({
        selectedPlotID: R.always(plotQueryID),
        plotQueries: R.always(R.isNil(resultsPagePlots) ? comparePagePlots : resultsPagePlots)
      })(state)
    },

    'comparePage/updatePlot': (state, payload) => {
      const {plotQueries: comparePagePlots} = state
      const {plotQuery} = payload
      const plotToUpdate = R.find(R.propEq('plotQueryID', plotQuery.plotQueryID))(comparePagePlots)
      return R.evolve({
        plotQueries: R.always(R.update(
          R.findIndex(R.propEq('plotQueryID', plotQuery.plotQueryID))(comparePagePlots),
          R.merge(plotToUpdate, plotQuery),
          comparePagePlots
        ))
      })(state)
    },
    
    'comparePage/addPlots': (state, payload) => {
      const {value} = payload
      return R.evolve({
        plotQueries: R.concat(R.map(R.compose(initiateService, cleanUpPlotQuery), value))
      })(state)
    },

    'comparePage/removePlots': (state, payload) => {
      const {value} = payload
      return R.evolve({
        plotQueries: R.filter(({plotQueryID}) => !R.includes(plotQueryID, value))
      })(state)
    },

    'comparePage/clearPlots': (state, payload) => {
      return R.evolve({
        plotQueries: R.always([])
      })(state)
    },
  }
)