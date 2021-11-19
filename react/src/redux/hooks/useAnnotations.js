import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useAnnotations() {
  // Get annotations object from redux store
  const annotationsSelector = createSelector(R.prop('annotations'), R.identity)
  const annotations = useSelector(annotationsSelector)
  return annotations
}