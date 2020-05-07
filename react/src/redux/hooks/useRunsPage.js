import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useRunsPage() {
  // Get context object from redux store
  const runsPageSelector = createSelector(R.prop('runsPage'), R.identity)
  const runsPage = useSelector(runsPageSelector)
  return runsPage
}
