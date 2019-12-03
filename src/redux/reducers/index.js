import { combineReducers } from "redux";
import * as R from "ramda";

// CONSTANTS
// import PARAMETERS from "../../components/main/vis/parameters/PARAMETERS";
// import hardSet from "redux-persist/es/stateReconciler/hardSet";

// Reducer
const initialState = {
    // Data from GQL
    user: null, // {userID, sessionToken, projects}
    project: null, // {}
    run: null,
    // View management
    view: {
        main: "projects", // 'login', 'projects', 'runs', 'vis'
        sidebar: null // 'dataset', 'pipeline', 'results'
    },
    toggle: {
        projects: {
            // "Explore" part of crescent
            activeKind: "published" // 'example', 'uploaded'
        },
        runs: {},
        vis: {
            pipeline: {
                activeStep: null,
                parameters: {
                    singleCell: "MTX",
                    numberGenes: { min: 50, max: 8000 },
                    percentMito: { min: 0, max: 0.2 },
                    resolution: 1,
                    principalDimensions: 10
                }
            },
            results: {
                activeResult: null, // selected plot: 'tsne', 'umap', 'violin', etc.
                activeGroup: null,
                selectedFeature: null,
                availableGroups: [], // ways to label the data (i.e. PatientID)
                availablePlots: [], // will store objects for each of the available plots
                isLoading: false
            }
        }
    }
};

const setParameters = R.set(R.lensPath(["toggle", "vis", "pipeline", "parameters"]));

const setMainView = R.set(R.lensPath(["view", "main"]));
const setSidebarView = R.set(R.lensPath(["view", "sidebar"]));

const setUserFromGQL = R.set(R.lensProp("user"));
const setProjectFromGQL = R.set(R.lensProp("project"));
const setRunFromGQL = R.set(R.lensProp("run"));

const createReducer = (initialState, handlers) => {
    return (state = initialState, action) => {
        const { type: actionType, payload } = action;
        if (R.has(actionType, handlers)) {
            return R.compose(R.apply(R.__, [state, payload]), R.prop(actionType))(handlers);
        } else {
            return state;
        }
    };
};

const LoginReducer = {
    LOGOUT: R.always(initialState)
};

const GQLReducer = {
    // GraphQL entrypoints
    // Need to reset selected project and run if new user entrypoint
    // And same for setting new project
    SET_USER: (state, payload) => {
        const { user } = payload;
        return R.compose(
            R.set(R.lensPath(["toggle", "projects", "activeKind"]), "uploaded"),
            setMainView("projects"),
            setRunFromGQL(null),
            setProjectFromGQL(null),
            setUserFromGQL(user)
        )(state);
    },

    SET_PROJECT: (state, payload) => {
        const { project } = payload;
        return R.compose(setMainView("runs"), setRunFromGQL(null), setProjectFromGQL(project))(state);
    },

    SET_RUN: (state, payload) => {
        const { run } = payload;
        return R.compose(setSidebarView("pipeline"), setMainView("vis"), setRunFromGQL(run))(state);
    }
};

const MainViewReducer = {
    // App can either be selecting projects and selecting/inspecting runs
    // Inspecting a run requires sidebar to be showing
    TOGGLE_LOGIN: (state, payload) => {
        return R.compose(setMainView("login"))(state);
    },
    TOGGLE_PROJECTS: (state, payload) => {
        return R.compose(setMainView("projects"))(state);
    },
    TOGGLE_RUNS: (state, payload) => {
        return R.compose(setMainView("runs"))(state);
    },
    TOGGLE_SIDEBAR: (state, payload) => {
        const { sidebar } = payload;
        return R.compose(setSidebarView(sidebar))(state);
    },

    // // Toggling different subviews
    TOGGLE_PROJECT_ACTIVE_KIND: (state, payload) => {
        const { projectKind } = payload;
        const setActiveProjectKind = R.set(R.lensPath(["toggle", "projects", "activeKind"]), projectKind);
        return setActiveProjectKind(state);
    },
    TOGGLE_PIPELINE_ACTIVE_STEP: (state, payload) => {
        const { step } = payload;
        const setActivePipelineStep = R.set(R.lensPath(["toggle", "vis", "pipeline", "activeStep"]), step);
        return R.compose(setActivePipelineStep)(state);
    },
    TOGGLE_RESULT_ACTIVE_RESULT: (state, payload) => {
        const { result } = payload;
        const setActiveResultToggle = R.set(R.lensPath(["toggle", "vis", "results", "activeResult"]), result);
        return setActiveResultToggle(state);
    }
};

const CWLReducer = {
    // Local data
    SET_PARAMETERS: (state, payload) => {
        const { parameters } = payload;
        return R.compose(setParameters(parameters))(state);
    }
};

const VisualizationReducer = {
    // visualization stuff
    TOGGLE_LOADING_RESULTS: (state, payload) => {
        const { loading } = payload;
        return R.set(R.lensPath(["toggle", "vis", "results", "isLoading"]), loading)(state);
    },
    INITIALIZE_RESULTS: (state, payload) => {
        const { plots, groups } = payload;
        const firstGroup = R.head(groups);
        return R.compose(
            // Set available plots with girst group for each
            R.set(
                R.lensPath(["toggle", "vis", "results", "availablePlots"]),
                R.map(
                    R.mergeRight({ data: null, selectedGroup: firstGroup, selectedFeature: null, isLoading: false }),
                    plots
                )
            ),
            // Set available groups
            R.set(R.lensPath(["toggle", "vis", "results", "availableGroups"]), groups),
            R.set(R.lensPath(["toggle", "vis", "results", "selectedGroup"]), groups[0])
        )(state);
    },
    TOGGLE_LOADING_PLOT: (state, payload) => {
        const { loading, plot } = payload;
        return R.set(R.lensPath(["toggle", "vis", "results", "availablePlots", plot, "isLoading"]), loading)(state);
    },
    INITIALIZE_PLOT_DATA: (state, payload) => {
        const { data, plot } = payload;
        return R.set(R.lensPath(["toggle", "vis", "results", "availablePlots", plot, "data"]), data)(state);
    },
    CLEAR_RESULTS: (state, payload) => {
        return R.compose(
            R.set(R.lensPath(["toggle", "vis", "results", "availablePlots"]), []),
            R.set(R.lensPath(["toggle", "vis", "results", "availableGroups"]), []),
            R.set(R.lensPath(["toggle", "vis", "results", "activeResult"]), null),
            R.set(R.lensPath(["toggle", "vis", "results", "selectedGroup"]), null),
            R.set(R.lensPath(["toggle", "vis", "results", "selectedFeature"]), null)
        )(state);
    },
    CHANGE_ACTIVE_GROUP: (state, payload) => {
        const { group } = payload;
        return R.set(R.lensPath(["toggle", "vis", "results", "selectedGroup"]), group)(state);
    },
    CHANGE_SELECTED_FEATURE: (state, payload) => {
        const { feature } = payload;
        return R.set(R.lensPath(["toggle", "vis", "results", "selectedFeature"]), feature)(state);
    }
};

const app = createReducer(initialState, {
    ...LoginReducer,
    ...GQLReducer,
    ...MainViewReducer,
    ...CWLReducer,
    ...VisualizationReducer
});

// const app = (state = initialState, action) => {
//   const {type, payload} = action

//   switch (type) {
//     // case 'LOGOUT':
//     //   return initialState

//     // GraphQL entrypoints
//     // Need to reset selected project and run if new user entrypoint
//     // And same for setting new project
//     // case 'SET_USER':
//     //   const {user} = payload
//     //   return R.compose(
//     //     R.set(
//     //       R.lensPath(['toggle','projects','activeKind']),
//     //       'uploaded',
//     //     ),
//     //     setMainView('projects'),
//     //     setRunFromGQL(null),
//     //     setProjectFromGQL(null),
//     //     setUserFromGQL(user)
//     //   )(state)
//     // case 'SET_PROJECT':
//     //   const {project} = payload
//     //   return R.compose(
//     //     setMainView('runs'),
//     //     setRunFromGQL(null),
//     //     setProjectFromGQL(project)
//     //   )(state)
//     // case 'SET_RUN':
//     //   const {run} = payload
//     //   return R.compose(
//     //     setSidebarView('pipeline'),
//     //     setMainView('vis'),
//     //     setRunFromGQL(run),
//     //   )(state)

//     // App can either be selecting projects and selecting/inspecting runs
//     // Inspecting a run requires sidebar to be showing
//     // case 'TOGGLE_LOGIN':
//     //   return R.compose(
//     //     setMainView('login')
//     //   )(state)
//     // case 'TOGGLE_PROJECTS':
//     //   return R.compose(
//     //     setMainView('projects')
//     //   )(state)
//     // case 'TOGGLE_RUNS':
//     //   return R.compose(
//     //     setMainView('runs')
//     //   )(state)
//     // case 'TOGGLE_SIDEBAR':
//     //   const {sidebar} = payload
//     //   return R.compose(
//     //     setSidebarView(sidebar)
//     //   )(state)

//     // // Toggling different subviews
//     // case 'TOGGLE_PROJECT_ACTIVE_KIND':
//     //   const {projectKind} = payload
//     //   const setActiveProjectKind = R.set(
//     //     R.lensPath(['toggle','projects','activeKind']),
//     //     projectKind
//     //   )
//     //   return setActiveProjectKind(state)
//     // case 'TOGGLE_PIPELINE_ACTIVE_STEP':
//     //   const {step} = payload
//     //   const setActivePipelineStep = R.set(
//     //     R.lensPath(['toggle','vis','pipeline','activeStep']),
//     //     step,
//     //   )
//     //   return R.compose(
//     //     setActivePipelineStep
//     //   )(state)
//     // case 'TOGGLE_RESULT_ACTIVE_RESULT':
//     //   const {result} = payload
//     //   const setActiveResultToggle = R.set(
//     //     R.lensPath(['toggle','vis','results','activeResult']),
//     //     result
//     //   )
//     //   return setActiveResultToggle(state)

//     // // Local data
//     // case 'SET_PARAMETERS':
//     //   const {parameters} = payload
//     //   return R.compose(
//     //     setParameters(parameters)
//     //   )(state)

//     // // visualization stuff
//     // case 'SET_AVAILABLE_RESULTS':
//     //   const {plots} = payload
//     //   const setAvailableResults = R.set(
//     //     R.lensPath(['toggle','vis', 'results', 'availableResults']),
//     //     plots
//     //   )
//     //   return setAvailableResults(state)
//     // case 'SET_AVAILABLE_GROUPS':
//     //   const {groups} = payload
//     //   const setAvailableGroups = R.set(
//     //     R.lensPath(['toggle','vis', 'results', 'availableGroups']),
//     //     groups
//     //   )
//     //   return setAvailableGroups(state)
//     // case 'SET_ACTIVE_GROUP':
//     //   const {group} = payload
//     //   const setActiveGroup = R.set(
//     //     R.lensPath(['toggle','vis', 'results', 'activeGroup']),
//     //     group
//     //   )
//     //   return setActiveGroup(state)

//     default:
//       return state
//   }
// }

// Combine all reducers for application
export default combineReducers({
    app
});
