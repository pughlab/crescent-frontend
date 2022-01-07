import * as R from 'ramda'
import createReducer from './createReducer'

const initialState = {
  annotationsService: null
}

export default createReducer(
  initialState,
  {
    'annotations/setAnnotationsService': (state, payload) => {
      const {service} = payload

      return R.evolve({
        annotationsService: R.always(service)
      })(state)
    }
  }
)