import { connect } from 'react-redux'

import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

import Actions from '../actions'

export default connect(
  state => state,
  dispatch => ({
    actions: {
      logout: () => dispatch(Actions.logout()),
      setProject: project => dispatch(Actions.setProject({project})),
      setGuestUser: user => dispatch(Actions.setGuestUser({user})),
      setUser: user =>  dispatch(Actions.setUser({user})),
      setRun: run => dispatch(Actions.setRun({run})),
      toggleInfo: () => dispatch(Actions.toggleInfo()),
      toggleLogin: () => dispatch(Actions.toggleLogin()),
      toggleProjects: (kind) => dispatch(Actions.toggleProjects({kind})),
      toggleRuns: () => dispatch(Actions.toggleRuns()),
      toggleSidebar: sidebar => dispatch(Actions.toggleSidebar({sidebar})),
      setParameters: parameters => dispatch(Actions.setParameters({parameters})),
      setIsSubmitted: isSubmitted => dispatch(Actions.toggle.vis.pipeline.setIsSubmitted({isSubmitted})),

      toggle: {
        setActiveProjectKind: projectKind => dispatch(Actions.toggle.project.setActiveProjectKind({projectKind})),
        setActivePipelineStep: step => dispatch(Actions.toggle.vis.pipeline.setActivePipelineStep({step})),
        setActiveResult: result => dispatch(Actions.toggle.vis.results.setActiveResult({result})),
      },

      thunks: {
        initializeResults: runID => dispatch(Actions.thunks.initializeResults(runID)),
        clearResults: () => dispatch(Actions.thunks.clearResults()),
        initializeScatter: runID => dispatch(Actions.thunks.initializeScatter(runID)),
        toggleLoadingResults: loading => dispatch(Actions.thunks.initializeResults(loading)),
        changeActiveGroup: newGroup => dispatch(Actions.thunks.changeActiveGroup(newGroup)),
        updateScatter: (runID, selectedGroup) => dispatch(Actions.thunks.updateScatter({runID, selectedGroup})),
        changeSelectedFeature: feature => dispatch(Actions.thunks.changeSelectedFeature(feature)),
        fetchScatter: () => dispatch(Actions.thunks.fetchScatter()),
        fetchOpacity: () => dispatch(Actions.thunks.fetchOpacity()),
        fetchViolin: () => dispatch(Actions.thunks.fetchViolin()),
        fetchTopExpressed: runID => dispatch(Actions.thunks.fetchTopExpressed(runID)),
        fetchQC: runID => dispatch(Actions.thunks.fetchQC(runID))
      }
    }
  })
)