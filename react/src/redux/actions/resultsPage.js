import * as R from 'ramda'

const setActiveSidebarTab = ({sidebarTab}) => ({
  type: 'resultsPage/setActiveSidebarTab',
  payload: {
    sidebarTab
  }
})

const resetResultsPage = R.always({type: 'resultsPage/reset'})

export {
  setActiveSidebarTab,
  resetResultsPage
}