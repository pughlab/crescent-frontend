import createSelectorHook from './createSelectorHook'
import * as R from 'ramda'

const useResultsPage = createSelectorHook('resultsPage', resultsPageState => {
  const {activePlot, plotQueries} = resultsPageState
  const activePlotQuery = plotQueries[activePlot]
  
  return R.mergeLeft(
    resultsPageState,
    activePlotQuery
  )
})

export const useResultsPagePlotQuery = index => {
  const {plotQueries} = useResultsPage()
  const plotQuery = plotQueries[index]
  
  return plotQuery
}

export default useResultsPage