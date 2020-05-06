import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useCrescentContext() {
  // Get context object from redux store
  const contextSelector = createSelector(R.prop('context'), R.identity)
  const context = useSelector(contextSelector)
  return context
}
