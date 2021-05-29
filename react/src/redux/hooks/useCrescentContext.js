import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useCrescentContext() {
  // Get context object from redux store
  const contextSelector = createSelector(
    R.prop('context'),
    context => ({...context, userID: context.keycloakUser ? context.keycloakUser.keycloakUserID : null})
  )
  const context = useSelector(contextSelector)
  console.log(context)
  return context
}
