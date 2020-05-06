import * as R from 'ramda'
import * as RA from 'ramda-adjunct'

export default function createReducer(initialState, handlers) {
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