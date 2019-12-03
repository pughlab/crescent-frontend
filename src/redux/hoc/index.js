import { connect } from "react-redux";

import Actions from "../actions";

export default connect(
    state => state,
    dispatch => ({
        actions: {
            logout: () => dispatch(Actions.logout()),
            setProject: project => dispatch(Actions.setProject({ project })),
            setUser: user => dispatch(Actions.setUser({ user })),
            setRun: run => dispatch(Actions.setRun({ run })),
            toggleLogin: () => dispatch(Actions.toggleLogin()),
            toggleProjects: () => dispatch(Actions.toggleProjects()),
            toggleRuns: () => dispatch(Actions.toggleRuns()),
            toggleSidebar: sidebar => dispatch(Actions.toggleSidebar({ sidebar })),
            setParameters: parameters => dispatch(Actions.setParameters({ parameters })),

            toggle: {
                setActiveProjectKind: projectKind =>
                    dispatch(Actions.toggle.project.setActiveProjectKind({ projectKind })),
                setActivePipelineStep: step => dispatch(Actions.toggle.vis.pipeline.setActivePipelineStep({ step })),
                setActiveResult: result => dispatch(Actions.toggle.vis.results.setActiveResult({ result }))
            },

            thunks: {
                initializeResults: runID => dispatch(Actions.thunks.initializeResults(runID)),
                clearResults: () => dispatch(Actions.thunks.clearResults()),
                initializeScatter: runID => dispatch(Actions.thunks.initializeScatter(runID)),
                toggleLoadingResults: loading => dispatch(Actions.thunks.initializeResults(loading)),
                changeActiveGroup: newGroup => dispatch(Actions.thunks.changeActiveGroup(newGroup)),
                updateScatter: (runID, selectedGroup) =>
                    dispatch(Actions.thunks.updateScatter({ runID, selectedGroup })),
                changeFeatureSearch: searchQuery => dispatch(Actions.thunks.changeFeatureSearch(searchQuery)),
                changeSelectedFeature: feature => dispatch(Actions.thunks.changeSelectedFeature(feature)),
                fetchScatter: () => dispatch(Actions.thunks.fetchScatter())
            }
        }
    })
);
