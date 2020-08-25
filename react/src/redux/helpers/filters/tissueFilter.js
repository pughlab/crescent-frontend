import * as R from 'ramda'
export default {
  initialState: {
    tissueFilter: {
      cancer: true,
      nonCancer: true
    }
  },
  
  setTissueFilter: {
    action: R.curry(
      (domain, {cancer, nonCancer}) => ({
        type: `${domain}/setTissueFilter`,
        payload: {
          cancer, nonCancer
        }
      })
    ),

    reducer: (state, payload) => {
      const {cancer, nonCancer} = payload
      return R.evolve({
        tissueFilter: R.always({cancer, nonCancer})
      })(state)
    }
  }
}