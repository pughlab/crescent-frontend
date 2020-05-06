import * as R from 'ramda'
// Redux
import {useSelector} from 'react-redux'
import {createSelector} from 'reselect'

export default function useProjectsPage() {
  // Get context object from redux store
  const projectsPageSelector = createSelector(R.prop('projectsPage'), R.identity)
  const projectsPage = useSelector(projectsPageSelector)
  return projectsPage
}
