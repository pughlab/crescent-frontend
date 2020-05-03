import { combineReducers } from 'redux'
import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

// Reducer
const initialState = {
  // Data from GQL
  user: null, // {userID, sessionToken, projects}
  project: null, // {}
  run: null,
  // View management
  view: {
    main: 'projects', // 'projects', 'runs', 'vis'
    sidebar: null, // 'pipeline', 'results'
    isGuest: true, // true, false
  },
  toggle: {
    projects: {
      // "Explore" part of crescent
      activeKind: 'published' // 'uploaded' 
    },
    runs: {},
    vis: {
      pipeline: {
        activeStep: null,
        parameters: {
          // multiple quality control,
          datasetsQualityControl: {
            // id : {
            //   singleCell: 'MTX',
            //   numberGenes: {min: 50, max: 8000},
            //   percentMito: {min: 0, max: 0.2},
            // }
          },

          singleCell: 'MTX',
          //numberGenes: {min: 50, max: 8000},
          percentMito: {min: 0, max: 0.2},
          // percentRibo: {min: 0, max: 0.75},
          resolution: 1.0,
          principalDimensions: 10,
          normalizationMethod: '2',
          applyCellFilters: 'Y',
          returnThreshold: 0.01,
        },
        isSubmitted: false
      },
      results: {
        activeResult: null, // selected plot: 'tsne', 'umap', 'violin', etc.
        activeGroup: null,
        selectedFeature: null,
        availableGroups: [], // ways to label the data (i.e. PatientID)
        availablePlots: [], // will store objects for each of the available plots
        isLoading: false,
        topExpressed: [],// will store the top X expressed genes for the run
        selectedQC: null
      }
    }
  }
}

const setParameters = R.set(R.lensPath(['toggle', 'vis', 'pipeline', 'parameters']))

const setMainView = R.set(R.lensPath(['view', 'main']))
const setSidebarView = R.set(R.lensPath(['view', 'sidebar']))

const setUserFromGQL = R.set(R.lensProp('user'))
const setProjectFromGQL = R.set(R.lensProp('project'))
const setRunFromGQL = R.set(R.lensProp('run'))


const createReducer = (initialState, handlers) => {
  return (state = initialState, action) => {
    const {type: actionType, payload} = action
    if (R.has(actionType, handlers)) {
      return R.compose(
        R.apply(R.__, [state, payload]),
        R.prop(actionType)
      )(handlers)
    }
    else {
      return state
    }
  }
}

const LoginReducer = {
  // 'LOGOUT': R.always(initialState),
}

const GQLReducer = {
  // GraphQL entrypoints
  // Need to reset selected project and run if new user entrypoint
  // And same for setting new project 
  'SET_USER':
    (state, payload) => {
      const {user} = payload
      return R.compose(
        R.set(
          R.lensPath(['toggle','projects','activeKind']),
          'uploaded',
        ),
        // Flag as not a guest
        R.set(
          R.lensPath(['view','isGuest']),
          false,
        ),
        setMainView('projects'),
        setRunFromGQL(null),
        setProjectFromGQL(null),
        setUserFromGQL(user)
      )(state)
    },
  'SET_GUEST_USER':
    (state, payload) => {
      const {user} = payload
      return R.compose(
        R.set(
          R.lensPath(['view','isGuest']),
          true,
        ),
        setMainView('projects'),
        setRunFromGQL(null),
        setProjectFromGQL(null),
        setUserFromGQL(user)

      )(state)
    },

  'SET_PROJECT':
    (state, payload) => {
      const {project} = payload
      return R.compose(
        setMainView('runs'),
        setRunFromGQL(null),
        setProjectFromGQL(project)
      )(state)
    },

  'SET_RUN':
    (state, payload) => {
      const {run} = payload
      const {params, datasets} = run
      // Only used for disabling parameters and submit after initial submit
      const resetIsSubmitted = R.set(
        R.lensPath(['toggle','vis','pipeline','isSubmitted']),
        false
      )
      const resetActiveStep = R.set(
        R.lensPath(['toggle','vis','pipeline','activeStep']),
        null
      )
      const {status: runStatus} = run
      return R.compose(
        resetIsSubmitted,
        resetActiveStep,
        setParameters(
          R.isNil(params) ?
            {
              datasetsQualityControl: R.reduce(
                (datasetsQualityControl, {datasetID}) => ({
                  ...datasetsQualityControl,
                  [datasetID]: {
                    singleCell: 'MTX',
                    numberGenes: {min: 50, max: 8000},
                    percentMito: {min: 0, max: 0.2},
                    // percentRibo: {min: 0, max: 0.75},
                  }
                }),
                {},
                datasets
              ),
              resolution: 1.0,
              principalDimensions: 10,
              normalizationMethod: '2',
              applyCellFilters: 'Y',
              returnThreshold: 0.01,
            }
          : JSON.parse(params)
        ),
        setSidebarView(
          R.equals('pending', runStatus) ? 'pipeline' : 'results'
        ),
        setMainView('vis'),
        setRunFromGQL(run), 
      )(state)
    }
}

const MainViewReducer = {
    // App can either be selecting projects and selecting/inspecting runs
    // Inspecting a run requires sidebar to be showing
  'TOGGLE_PROJECTS':
    (state, payload) => {
      const {kind} = payload
      return R.compose(
        setRunFromGQL(null),
        setProjectFromGQL(null),
        R.isNil(kind) ? R.identity :
          R.set(
            R.lensPath(['toggle','projects','activeKind']),
            kind
          ),
        setMainView('projects')
      )(state)
    },
  'TOGGLE_RUNS':
    (state, payload) => {
      return R.compose(
        setMainView('runs')
      )(state)
    },
  'TOGGLE_SIDEBAR':
    (state, payload) => {
      const {sidebar} = payload
      return R.compose(
        setSidebarView(sidebar)
      )(state)
    },


    // // Toggling different subviews
  'TOGGLE_PROJECT_ACTIVE_KIND': 
    (state, payload) => {
      const {projectKind} = payload
      const setActiveProjectKind = R.set(
        R.lensPath(['toggle','projects','activeKind']),
        projectKind
      )
      return setActiveProjectKind(state)
    },
  'TOGGLE_PIPELINE_ACTIVE_STEP': 
    (state, payload) => {
      const {step} = payload 
      const setActivePipelineStep = R.set(
        R.lensPath(['toggle','vis','pipeline','activeStep']),
        step,
      )
      return R.compose(
        setActivePipelineStep
      )(state)
    },
  'TOGGLE_RESULT_ACTIVE_RESULT': 
    (state, payload) => {
      const {result} = payload
      const setActiveResultToggle = R.set(
        R.lensPath(['toggle','vis','results','activeResult']),
        result
      )
      return setActiveResultToggle(state)
    }}


const CWLReducer = {
  // Local data
  'SET_PARAMETERS':
    (state, payload) => {
      const {parameters} = payload
      const oldParameters = R.path(['toggle', 'vis', 'pipeline', 'parameters'], state)
      const newParameters = R.mergeRight(oldParameters, parameters)
      return R.compose(
        setParameters(newParameters)
      )(state)
    },
  'SET_IS_SUBMITTED':
    (state, payload) => {
      const {isSubmitted} = payload

      return R.compose(
        setMainView('projects'),
        R.set(
          R.lensPath(['toggle','vis','pipeline','isSubmitted']),
          isSubmitted
        )
      )(state)
    }
}

const VisualizationReducer = {
  // visualization stuff
  'TOGGLE_LOADING_RESULTS': (state, payload) => {
    const {loading} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','isLoading']),
      loading
    )(state)
  },
  'INITIALIZE_RESULTS': (state, payload) => {
    const {plots, groups} = payload
    const firstGroup = R.head(groups)
    return R.compose(
      // Set available plots with girst group for each
      R.set(
        R.lensPath(['toggle','vis','results','availablePlots']),
        R.map(
          R.mergeRight({data: null, selectedGroup: firstGroup, selectedFeature: null, isLoading: false}),
          plots
        ),
      ),
      // Set available groups
      R.set(
        R.lensPath(['toggle','vis','results','availableGroups']),
        groups
      ),
      R.set(
        R.lensPath(['toggle','vis','results','selectedGroup']),
        groups[0]
      )
    )(state)
  },
  'TOGGLE_LOADING_PLOT': (state, payload) => {
    const {loading, plot} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','availablePlots',plot,'isLoading']),
      loading
    )(state)
  },
  'INITIALIZE_PLOT_DATA': (state, payload) => {
    const {data, plot} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','availablePlots',plot,'data']),
      data
    )(state)
  },
  'CHANGE_ACTIVE_GROUP': (state, payload) => {
    const {group} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','selectedGroup']),
      group
    )(state)
  },
  'CHANGE_SELECTED_FEATURE': (state, payload) => {
    const {feature} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','selectedFeature']),
      feature
    )(state)
  },
  'SET_TOP_EXPRESSED': (state, payload) => {
    const {features} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','topExpressed']),
      features
    )(state)
  },
  'SET_SELECTED_QC': (state, payload) => {
    const {value} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','selectedQC']),
      value
    )(state)
  },
  'SET_AVAILABLE_GROUPS': (state, payload) => {
    const {groups} = payload
    return R.set(
      R.lensPath(['toggle','vis','results','availableGroups']),
      groups
    )(state)
  },
  'CLEAR_RESULTS': (state, payload) => {
    return R.compose(
      R.set(
        R.lensPath(['toggle','vis','results','availablePlots']),
        []
      ),
      R.set(
        R.lensPath(['toggle','vis','results','availableGroups']),
        []
      ),
      R.set(
        R.lensPath(['toggle','vis','results','activeResult']),
        null
      ),
      R.set(
        R.lensPath(['toggle','vis','results','selectedGroup']),
        null
      ),
      R.set(
        R.lensPath(['toggle','vis','results','selectedFeature']),
        null
      ),
      R.set(
        R.lensPath(['toggle','vis','results','topExpressed']),
        []
      )
    )(state)
  }
}

const app = createReducer(initialState, {
  ...LoginReducer,
  ...GQLReducer,
  ...MainViewReducer,
  ...CWLReducer,
  ...VisualizationReducer,
})

// Combine all reducers for application
export default combineReducers({
  app
})