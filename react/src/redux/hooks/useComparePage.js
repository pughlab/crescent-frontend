import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useComparePage() {
  // Get comparePage object from redux store
  const comparePageSelector = createSelector(R.prop('comparePage'), R.identity)
  const comparePage = useSelector(comparePageSelector)
  return comparePage
}