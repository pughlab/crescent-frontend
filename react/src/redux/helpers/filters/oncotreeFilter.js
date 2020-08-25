import * as R from 'ramda'
export default {
  initialState: {
    oncotreeFilter: []
  },

  setOncotreeFilter: {
    action: R.curry(
      (domain, {codes}) => ({
        type: `${domain}/setOncotreeFilter`,
        payload: {
          codes
        }
      })
    ),
    reducer: (state, payload) => {
      const {codes} = payload
      return R.evolve({
        oncotreeFilter: R.always(codes)
      })(state)
    }
  }
}