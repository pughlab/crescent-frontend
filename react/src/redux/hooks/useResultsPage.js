import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useResultsPage() {
  // Get context object from redux store
  const resultsPageSelector = createSelector(
    R.prop('resultsPage'),
    resultsPageState => {
      const {activePlot, plotQueries} = resultsPageState
      const activePlotQuery = plotQueries[activePlot]
      return R.mergeLeft(
        resultsPageState,
        activePlotQuery
      )
    }
  
  )
  const resultsPage = useSelector(resultsPageSelector)

  console.log(resultsPage)
  return resultsPage
}

export function useResultsPagePlotQuery(index) {
  const {plotQueries} = useResultsPage()
  const plotQuery = plotQueries[index]
  return plotQuery
}