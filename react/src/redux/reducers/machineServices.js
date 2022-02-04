import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  annotationsService: null,
  newProjectService: null
}

export default createReducer(
  initialState,
  {
    // For secondary runs
    'machineServices/setAnnotationsService': (state, payload) => {
      const {service} = payload

      return R.evolve({
        annotationsService: R.always(service)
      })(state)
    },
    // For new project creation
    'machineServices/setNewProjectService': (state, payload) => {
      const {service} = payload

      return R.evolve({
        newProjectService: R.always(service)
      })(state)
    }
  }
)