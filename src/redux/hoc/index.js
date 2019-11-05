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
      setUser: user =>  dispatch(Actions.setUser({user})),
      setRun: run => dispatch(Actions.setRun({run})),
      toggleLogin: () => dispatch(Actions.toggleLogin()),
      toggleProjects: () => dispatch(Actions.toggleProjects()),
      toggleRuns: () => dispatch(Actions.toggleRuns()),
      toggleSidebar: sidebar => dispatch(Actions.toggleSidebar({sidebar})),
      setParameters: parameters => dispatch(Actions.setParameters({parameters})),
      setAvailableGroups: groups => dispatch(Actions.setAvailableGroups({groups})),

      toggle: {
        setActiveProjectKind: projectKind => dispatch(Actions.toggle.project.setActiveProjectKind({projectKind})),
        setActivePipelineStep: step => dispatch(Actions.toggle.vis.pipeline.setActivePipelineStep({step})),
        setActivePipelineParameter: parameter => dispatch(Actions.toggle.vis.pipeline.setActivePipelineParameter({parameter})),
        setActiveResult: result => dispatch(Actions.toggle.vis.results.setActiveResult({result})),
      }
    }
  })
)