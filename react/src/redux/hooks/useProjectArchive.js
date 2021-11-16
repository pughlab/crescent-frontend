import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useProjectArchive() {
  // Get project archive object from redux store
  const projectArchiveSelector = createSelector(R.prop('projectArchive'), R.identity)
  const projectArchive = useSelector(projectArchiveSelector)
  return projectArchive
}