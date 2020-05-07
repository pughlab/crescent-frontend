import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useResultsPage() {
  // Get context object from redux store
  const resultsPageSelector = createSelector(R.prop('resultsPage'), R.identity)
  const resultsPage = useSelector(resultsPageSelector)
  return resultsPage
}
